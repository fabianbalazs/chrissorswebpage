const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const source = fs.readFileSync(path.join(__dirname, '../js/script.js'), 'utf8');
const appSource = source.slice(source.indexOf('const app = {'), source.indexOf('app.init();'));

async function setup(dateHeader = 'Wed, 04 Nov 2026 23:30:00 GMT') {
    const listeners = [];
    const elements = new Map();
    const auth = { currentUser: { uid: 'guest' }, onAuthStateChanged(callback) { this.change = callback; } };
    const storage = new Map();
    const query = (name, filters = [], id) => ({
        where(...filter) { return query(name, [...filters, filter], id); },
        doc(value = 'new-booking') { return query(name, filters, value); },
        limit() { return this; },
        async get() { return { empty: false }; },
        onSnapshot(...args) {
            const hasOptions = typeof args[0] !== 'function';
            const listener = { name, filters, id, next: args[hasOptions ? 1 : 0],
                error: args[hasOptions ? 2 : 1], stopped: false };
            listeners.push(listener);
            return () => { listener.stopped = true; };
        }
    });
    const element = id => {
        if (!elements.has(id)) elements.set(id, {
            value: '', disabled: false, classList: { contains: () => true, add() {}, remove() {} }
        });
        return elements.get(id);
    };
    const context = {
        db: { collection: query },
        firebase: { auth: () => auth, firestore: { FieldValue: { serverTimestamp: () => 'timestamp' } } },
        fetch: async () => ({ ok: true, headers: { get: () => dateHeader } }),
        AbortSignal, Intl, Date, performance,
        console: { error() {}, warn() {}, log() {} },
        window: { scrollTo() {}, location: { href: 'https://example.test/', pathname: '/', search: '', hash: '' } },
        document: { getElementById: element, querySelector: () => element('header'), querySelectorAll: () => [] },
        localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) }
    };
    vm.createContext(context);
    vm.runInContext(appSource + '\nglobalThis.app = app;', context);
    const app = context.app;
    for (const method of ['renderPublicSlots', 'renderAdminLists', 'renderAdminCalendar',
        'renderAdminReviews', 'renderAdminServices', 'renderPublicReviews']) app[method] = () => {};
    await app.init();
    return { app, listeners, auth, element, storage, db: context.db };
}

function snapshot(docs = [], fromCache = false) {
    return { metadata: { fromCache }, docs: docs.map(([id, data]) => ({ id, data: () => data })) };
}

test('uses server time in Budapest and requires all server-confirmed calendar data', async () => {
    const { app, listeners } = await setup();
    assert.equal(app.firstBookingDate, '2026-11-05');
    assert.equal(app.currentTime().toISOString().slice(0, 16), '2026-11-04T23:30');
    const active = name => listeners.find(item => item.name === name && !item.id);
    const ready = listeners.find(item => item.id === '_ready');
    ready.next({ metadata: { fromCache: false }, exists: true, data: () => ({ ready: true }) });
    active('occupiedTimes').next(snapshot());
    active('appointments').next(snapshot());
    assert.equal(app.bookingsLoaded, false);
    active('schedules').next(snapshot());
    assert.equal(app.bookingsLoaded, true);
    active('schedules').error({ code: 'unavailable' });
    assert.equal(app.bookingsLoaded, false);
    assert.equal(active('occupiedTimes').filters[0][2], '2026-11-05');
});

test('missing server time keeps the full date range for safety', async () => {
    const { app } = await setup(null);
    assert.equal(app.firstBookingDate, '0000-01-01');
});

test('admin data starts on dashboard, month changes preserve user listeners, leaving stops it', async () => {
    const { app, listeners } = await setup();
    app.currentAdmin = 'Admin';
    app.currentCalendarDate = new Date(2026, 10, 30);
    assert.equal(listeners.filter(item => item.name === 'users').length, 0);
    app.showDashboard();
    const bookings = listeners.find(item => item.name === 'bookings');
    assert.equal(bookings.filters[0][2], '2026-10-01');
    assert.equal(bookings.filters[1][2], '2026-12-01');
    app.showDashboard();
    assert.equal(listeners.filter(item => item.name === 'users').length, 1);
    app.changeMonth(1);
    assert.equal(app.currentCalendarDate.getMonth(), 11);
    assert.equal(app.currentCalendarDate.getDate(), 1);
    assert.equal(bookings.stopped, true);
    assert.equal(listeners.filter(item => item.name === 'users').length, 1);
    const currentBookings = listeners.filter(item => item.name === 'bookings').at(-1);
    assert.equal(currentBookings.filters[1][2], '2027-01-01');
    app.hideAllViews(true);
    assert.equal(currentBookings.stopped, false);
    app.hideAllViews();
    assert.equal(currentBookings.stopped, true);
    assert.equal(listeners.filter(item => item.name === 'users').every(item => item.stopped), true);
});

test('public reviews are approved-only and existing pending reviews suppress reminders', async () => {
    const { app, listeners } = await setup();
    assert.equal(listeners.find(item => item.name === 'reviews').filters[0][2], 'approved');
    app.activeUser = { id: 'guest' };
    app.myAppointments = [{ id: 'old', date: '2020-01-01', start: '10:00' }];
    app.showReviewPopup = () => assert.fail('Existing review must suppress the popup');
    await app.checkPendingReviews();
    assert.equal(app.checkingReviews, false);
});

test('missing composite index falls back safely and its listener is stopped on navigation', async () => {
    const { app, listeners } = await setup();
    listeners.find(item => item.name === 'appointments').error({ code: 'failed-precondition' });
    const fallback = listeners.filter(item => item.name === 'appointments').at(-1);
    assert.equal(fallback.filters.length, 1);
    fallback.next(snapshot([
        ['old', { date: '2020-01-01', time: '10:00', maxDuration: 30 }],
        ['new', { date: '2026-12-01', time: '10:00', maxDuration: 30 }]
    ]));
    assert.equal(app.legacyFreeSlots.length, 1);
    assert.equal(app.legacyFreeSlots[0].date, '2026-12-01');
    app.currentAdmin = 'Admin';
    app.startAdminData();
    assert.equal(fallback.stopped, true);
});

test('double booking submission sends one request and restores the button after failure', async () => {
    const { app, element } = await setup();
    app.activeUser = { id: 'guest', name: 'Guest' };
    app.bookingsLoaded = true;
    app.pendingSelection = { total: 30, items: [{ name: 'Haircut' }] };
    app.bookingStartTime = '10:00';
    app.bookingDate = '2026-12-01';
    element('client-email').value = 'guest@example.test';
    element('client-phone').value = '123456789';
    app.availableStartTimes = () => ['10:00'];
    app.showNotification = () => {};
    app.showBookingSuccess = () => assert.fail('Failed saves must not show confirmation');
    let requests = 0;
    let rejectSave;
    app.saveBookingTime = () => {
        requests++;
        return new Promise((resolve, reject) => { rejectSave = reject; });
    };
    app.submitBooking();
    app.submitBooking();
    assert.equal(requests, 1);
    assert.equal(element('btn-submit-booking').disabled, true);
    rejectSave(new Error('unavailable'));
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(app.bookingSaving, false);
    assert.equal(element('btn-submit-booking').disabled, false);
});

test('saving a schedule outside the loaded month updates its existing document', async () => {
    const { app, element, db } = await setup();
    element('new-loc').value = 'Debrecen';
    element('new-date').value = '2027-04-01';
    element('new-start-time').value = '09:00';
    element('new-end-time').value = '17:00';
    app.schedules = [];
    app.showNotification = () => {};
    let updatedId;
    db.collection = name => {
        assert.equal(name, 'schedules');
        const query = {
            where() { return this; },
            limit() { return this; },
            async get(options) {
                assert.equal(options.source, 'server');
                return { docs: [{ id: 'existing-april-day' }] };
            },
            doc(id) { updatedId = id; return { update: async () => {} }; },
            add() { assert.fail('Must update the existing day'); }
        };
        return query;
    };
    await app.saveSchedule();
    assert.equal(updatedId, 'existing-april-day');
});

test('review reminders still appear for an appointment without a review', async () => {
    const { app, db } = await setup();
    app.activeUser = { id: 'guest' };
    app.myAppointments = [{ id: 'unreviewed', date: '2020-01-01', start: '10:00' }];
    db.collection = () => ({
        where() { return this; }, limit() { return this; }, async get() { return { empty: true }; }
    });
    let shown;
    app.showReviewPopup = id => { shown = id; };
    await app.checkPendingReviews();
    assert.equal(shown, 'unreviewed');
});

test('confirmation opens only after saving and uses the submitted booking even if selection changes', async () => {
    const { app, element } = await setup();
    app.activeUser = { id: 'guest', name: 'Guest' };
    app.bookingsLoaded = true;
    app.currentLocation = 'Debrecen';
    app.pendingSelection = { total: 30, items: [{ name: 'Haircut' }] };
    app.bookingStartTime = '10:00';
    app.bookingDate = '2026-12-01';
    element('client-email').value = 'guest@example.test';
    element('client-phone').value = '123456789';
    app.availableStartTimes = () => ['10:00'];
    let resolveSave;
    let confirmation;
    app.saveBookingTime = () => new Promise(resolve => { resolveSave = resolve; });
    app.closeBookingModal = () => { app.pendingSelection = null; app.bookingStartTime = null; };
    app.showBookingSuccess = saved => { confirmation = saved; };
    app.showHome = () => assert.fail('Must show confirmation instead of home');
    app.submitBooking();
    assert.equal(confirmation, undefined);
    app.currentLocation = 'Fehérgyarmat';
    app.bookingDate = '2026-12-02';
    resolveSave();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(confirmation.location, 'Debrecen');
    assert.equal(confirmation.date, '2026-12-01');
    assert.equal(confirmation.start, '10:00');
    assert.equal(confirmation.end, '10:30');
    assert.equal(app.bookingSaving, false);
    assert.equal(element('btn-submit-booking').disabled, false);
});

test('confirmation renders both locations and moves focus to the success heading', async () => {
    const { app, element } = await setup();
    let focused = false;
    app.hideAllViews = () => {};
    element('booking-success-title').focus = () => { focused = true; };
    const saved = { date: '2026-12-01', start: '10:00', end: '10:30', location: 'Debrecen' };
    app.showBookingSuccess(saved);
    assert.match(element('booking-success-date').textContent, /2026\.12\.01/);
    assert.equal(element('booking-success-time').textContent, '10:00 – 10:30');
    assert.match(element('booking-success-location').textContent, /Debrecen.*Mester utca 31\./);
    assert.equal(focused, true);
    app.showBookingSuccess({ ...saved, location: 'Fehérgyarmat' });
    assert.equal(element('booking-success-location').textContent, 'Fehérgyarmat');
});
