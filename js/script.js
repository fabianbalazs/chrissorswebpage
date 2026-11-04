/* =====================================================
   PRELOADER — betöltő animáció lezárása
   ===================================================== */
(function () {
    window.addEventListener('load', function () {
        var pre = document.getElementById('preloader');
        setTimeout(function () {
            pre.classList.add('preloader-done');
            document.documentElement.classList.remove('preload-lock');
            setTimeout(function () { pre.remove(); }, 700);
        }, 1150);
    });
})();

/* =====================================================
   NAVIGÁCIÓ — sima görgetés, how-to kártyák lapozása
   ===================================================== */
function smoothScrollTo(targetId) {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
    document.getElementById(targetId)?.scrollIntoView({ behavior, block: 'start' });
}

const galleryTrack = document.getElementById('gallery-track');
function toggleGalleryRibbon(paused = !galleryTrack.classList.contains('is-paused')) {
    galleryTrack.classList.toggle('is-paused', paused);
}
const galleryLightbox = document.getElementById('lightbox');
const galleryImages = [...galleryTrack.querySelectorAll('img:not([aria-hidden])')];
let galleryImageIndex = 0;
function showGalleryImage(index) {
    galleryImageIndex = (index + galleryImages.length) % galleryImages.length;
    const source = galleryImages[galleryImageIndex];
    const image = document.getElementById('lightbox-img');
    image.src = source.src;
    image.alt = source.alt;
    document.getElementById('lightbox-cur').textContent = galleryImageIndex + 1;
}
function openGalleryImage(image) {
    toggleGalleryRibbon(true);
    showGalleryImage(Number(image.dataset.index));
    galleryLightbox.showModal();
}
galleryImages.forEach(image => {
    image.tabIndex = 0;
    image.setAttribute('role', 'button');
    image.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        openGalleryImage(image);
    });
});
galleryLightbox.querySelector('.lightbox-close').addEventListener('click', () => galleryLightbox.close());
galleryLightbox.querySelector('.lightbox-prev').addEventListener('click', () => showGalleryImage(galleryImageIndex - 1));
galleryLightbox.querySelector('.lightbox-next').addEventListener('click', () => showGalleryImage(galleryImageIndex + 1));
galleryLightbox.addEventListener('close', () => toggleGalleryRibbon(false));
document.getElementById('gallery-ribbon').addEventListener('click', event => {
    const image = event.target.closest('#gallery-track img');
    if (image) {
        openGalleryImage(image);
    } else if (event.pointerType === 'touch') {
        toggleGalleryRibbon();
    }
});
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) toggleGalleryRibbon();


function scrollHowSteps(dir) {
    var track = document.querySelector('.how-inner');
    var step = track.querySelector('.how-step');
    if (!track || !step) return;
    var styles = window.getComputedStyle(track);
    var gap = parseFloat(styles.columnGap || styles.gap || 0) || 0;
    var amount = step.getBoundingClientRect().width + gap;
    track.scrollBy({ left: dir * amount, behavior: 'smooth' });
}

function updateHowProgress() {
    var track = document.querySelector('.how-inner');
    var fill = document.getElementById('how-progress-fill');
    if (!track || !fill) return;
    var steps = track.querySelectorAll('.how-step');
    if (!steps.length) return;
    var stepWidth = steps[0].getBoundingClientRect().width;
    if (!stepWidth) return;
    var index = Math.round(track.scrollLeft / stepWidth);
    index = Math.max(0, Math.min(steps.length - 1, index));
    fill.style.width = (((index + 1) / steps.length) * 100) + '%';
}

document.addEventListener('DOMContentLoaded', function () {
    var track = document.querySelector('.how-inner');
    if (!track) return;
    track.scrollLeft = 0;
    updateHowProgress();
    track.addEventListener('scroll', function () {
        window.requestAnimationFrame(updateHowProgress);
    });
    window.addEventListener('resize', updateHowProgress);
});


/* =====================================================
   FEJLÉC — szolgáltatások lenyíló menü
   ===================================================== */
function openServicesNav() {
    document.getElementById('services-nav-panel').classList.add('open');
    document.getElementById('services-nav-btn').classList.add('active');
}
function closeServicesNav() {
    document.getElementById('services-nav-panel').classList.remove('open');
    document.getElementById('services-nav-btn').classList.remove('active');
}
const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
const mobileNavHeader = mobileNavToggle.closest('header');
function setMobileNav(open) {
    mobileNavHeader.classList.toggle('mobile-nav-open', open);
    mobileNavToggle.setAttribute('aria-expanded', String(open));
    if (!open) closeServicesNav();
}
mobileNavToggle.addEventListener('click', () => setMobileNav(!mobileNavHeader.classList.contains('mobile-nav-open')));
mobileNavHeader.querySelectorAll('nav > a, .nav-dropdown-panel a, .nav-dropdown-panel button').forEach(item => {
    item.addEventListener('click', () => {
        if (mobileNavHeader.classList.contains('mobile-nav-open')) setMobileNav(false);
    });
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileNavHeader.classList.contains('mobile-nav-open')) {
        setMobileNav(false);
        mobileNavToggle.focus();
    }
});
document.querySelectorAll('.nav-mega-item').forEach(function (item) {
    item.addEventListener('click', closeServicesNav);
});
function toggleServicesNav(e) {
    e.stopPropagation();
    if (window.matchMedia('(hover: hover)').matches) return;
    var panel = document.getElementById('services-nav-panel');
    if (panel.classList.contains('open')) {
        closeServicesNav();
    } else {
        openServicesNav();
    }
}
document.addEventListener('click', function (e) {
    var panel = document.getElementById('services-nav-panel');
    if (panel && panel.classList.contains('open') && !e.target.closest('#services-nav-panel') && !e.target.closest('#services-nav-btn')) {
        closeServicesNav();
    }
});
(function () {
    var header = document.querySelector('header');
    var dropdown = document.querySelector('.nav-dropdown');
    var panel = document.getElementById('services-nav-panel');
    if (!header || !dropdown || !panel || !window.matchMedia('(hover: hover)').matches) return;
    dropdown.addEventListener('mouseenter', openServicesNav);
    header.addEventListener('mouseleave', closeServicesNav);
    document.querySelectorAll('.main-nav > .nav-link, .header-left').forEach(function (el) {
        el.addEventListener('mouseenter', closeServicesNav);
    });
})();


/* =====================================================
   GY.I.K. — lenyíló kérdés-válasz accordion
   ===================================================== */
function toggleFaq(btn) {
    var item = btn.closest('.faq-item');
    var wrap = item.querySelector('.faq-answer-wrap');
    var isOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
        if (openItem !== item) {
            openItem.classList.remove('open');
            var w = openItem.querySelector('.faq-answer-wrap');
            w.style.maxHeight = w.scrollHeight + 'px';
            requestAnimationFrame(function () { w.style.maxHeight = '0px'; });
        }
    });

    if (isOpen) {
        wrap.style.maxHeight = wrap.scrollHeight + 'px';
        requestAnimationFrame(function () { wrap.style.maxHeight = '0px'; });
        item.classList.remove('open');
    } else {
        item.classList.add('open');
        wrap.style.maxHeight = wrap.scrollHeight + 'px';
        wrap.addEventListener('transitionend', function handler() {
            if (item.classList.contains('open')) wrap.style.maxHeight = 'none';
            wrap.removeEventListener('transitionend', handler);
        });
    }
}
window.addEventListener('resize', function () {
    document.querySelectorAll('.faq-item.open .faq-answer-wrap').forEach(function (w) {
        w.style.maxHeight = 'none';
    });
});


/* =====================================================
   BELÉPÉS / REGISZTRÁCIÓ — jelszó mutatása, sütiszalag
   ===================================================== */
function togglePassword(btn) {
    var input = btn.parentElement.querySelector('input');
    var show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.classList.toggle('revealed', show);
}

function resetPasswordFields() {
    document.querySelectorAll('.password-wrap').forEach(function (wrap) {
        var input = wrap.querySelector('input');
        var btn = wrap.querySelector('.password-toggle');
        if (input) input.type = 'password';
        if (btn) btn.classList.remove('revealed');
    });
}

// Minden belépés/regisztráció megnyitásakor alaphelyzet: a jelszó rejtve
window.addEventListener('load', function () {
    resetPasswordFields();
    if (window.app) {
        ['showUserLogin', 'showRegister', 'showHome', 'showForgotPassword'].forEach(function (fn) {
            if (typeof app[fn] !== 'function') return;
            var original = app[fn].bind(app);
            app[fn] = function () {
                var result = original.apply(null, arguments);
                resetPasswordFields();
                return result;
            };
        });
    }
});

function acceptCookies() {
    try { localStorage.setItem('chrissors_cookies', '1'); } catch (e) {}
    document.getElementById('cookie-banner').classList.remove('show');
    setTimeout(function () {
        document.getElementById('cookie-banner').classList.add('hidden');
    }, 400);
}

window.addEventListener('load', function () {
    var accepted = false;
    try { accepted = localStorage.getItem('chrissors_cookies') === '1'; } catch (e) {}
    if (accepted) return;
    var banner = document.getElementById('cookie-banner');
    setTimeout(function () {
        banner.classList.remove('hidden');
        requestAnimationFrame(function () { banner.classList.add('show'); });
    }, 2000);
});



/* =====================================================
   FIREBASE ÉS FŐ ALKALMAZÁS-LOGIKA
   ===================================================== */
const firebaseConfig = {
    apiKey: "AIzaSyBbv9eJqmJipaNeb7PMTBKxckwukG02UpU",
    authDomain: "chrissor-web.firebaseapp.com",
    projectId: "chrissor-web",
    storageBucket: "chrissor-web.firebasestorage.app",
    messagingSenderId: "1016150872750",
    appId: "1:1016150872750:web:27600263d664ba0706133f"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* =====================================================
   FOGLALÁSI MENÜ
   -----------------------------------------------------
   A foglalási menü a Firestore `services` kollekcióból
   épül fel automatikusan — új, átnevezett vagy törölt
   szolgáltatások külön kódmódosítás nélkül érvényesülnek.
   Az időtartamok is onnan jönnek.
   ===================================================== */

const app = {
    schedules: [],      // a fodrász munkaideje (schedules kollekció)
    bookings: [],       // a tényleges foglalások (bookings kollekció)
    myAppointments: [],
    myAppointmentsError: false,
    bookingsLoaded: false,
    occupiedTimes: [],
    legacyFreeSlots: [],
    adminBookingsStatus: 'Foglalások betöltése…',
    users: [],
    reviews: [],
    services: [], 

    currentAdmin: null,
    activeUser: null,
    currentLocation: 'Fehérgyarmat',
    calendarLocation: 'Fehérgyarmat',
    bookingStartTime: null,
    bookingDate: null,
    pendingSelection: null,
    selectedServiceIds: [],
    currentCalendarDate: new Date(),
    modifyingSlotId: null,

    reviewingSlotId: null,
    currentRating: 0,
    editingReviewId: null,
    userSearchTerm: '',

    escapeHTML: function(str) {
        if (!str) return '';
        return str.toString().replace(/[&<>'"]/g, tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag));
    },

    // --- Idő-segédfüggvények (perc-alapú számolás) ---
    toMin: function(t) {
        const p = String(t).split(':');
        return (parseInt(p[0], 10) * 60) + parseInt(p[1], 10);
    },
    toTime: function(min) {
        const h = Math.floor(min / 60), m = min % 60;
        return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    },
    // A munkaidő összes 10 perces kezdési pontja, egyenként `state` jelöléssel:
    // 'free' = foglalható, 'busy' = foglalt/nem fér be, 'gap' = 10 perces lyukat hagyna.
    gridSlots: function(date, duration) {
        const sched = this.schedules.find(s => s.date === date && s.location === this.currentLocation);
        const dayBookings = this.occupiedTimes.filter(b => b.date === date && b.location === this.currentLocation);
        if (!sched) {
            const slots = new Map();
            for (const slot of this.legacyFreeSlots) {
                if (slot.date !== date || slot.location !== this.currentLocation) continue;
                const start = this.toMin(slot.time);
                const end = start + duration;
                const free = duration <= slot.maxDuration && end <= 1440 &&
                    new Date(`${date}T${slot.time}:00`).getTime() > Date.now() &&
                    !dayBookings.some(b => start < this.toMin(b.end) && end > this.toMin(b.start));
                if (free || !slots.has(slot.time)) slots.set(slot.time, free ? 'free' : 'busy');
            }
            return [...slots].sort(([a], [b]) => a.localeCompare(b))
                .map(([time, state]) => ({ time, state }));
        }
        const startMin = this.toMin(sched.start);
        const endMin = this.toMin(sched.end);
        const earliest = Date.now();
        const result = [];
        for (let t = startMin; t + 10 <= endMin; t += 10) {
            const time = this.toTime(t);
            const tEnd = t + duration;
            let state = 'free';
            if (t + duration > endMin) {
                state = 'busy';
            } else {
                const overlaps = dayBookings.some(b => {
                    const bStart = this.toMin(b.start);
                    const bEnd = this.toMin(b.end);
                    return t < bEnd && tEnd > bStart;
                });
                if (overlaps) {
                    state = 'busy';
                } else {
                    const dt = new Date(`${date}T${time}:00`);
                    if (dt.getTime() <= earliest) state = 'busy';
                }
            }

            // 10 perces lyuk elkerülése: csak ha van tényleges előző foglalás,
            // ami pontosan 10 perccel korábban ér véget (a munkanap kezdete nem számít lyuknak).
            if (state === 'free') {
                let prevEnd = null;
                for (const b of dayBookings) {
                    const bEnd = this.toMin(b.end);
                    if (bEnd <= t && (prevEnd === null || bEnd > prevEnd)) prevEnd = bEnd;
                }
                if (prevEnd !== null && t - prevEnd === 10) state = 'gap';
            }
            result.push({ time, state });
        }
        return result;
    },

    // Csak a szabad kezdési időpontok (a gridSlots alapján)
    availableStartTimes: function(date, duration) {
        return this.gridSlots(date, duration).filter(s => s.state === 'free').map(s => s.time);
    },

    init: function() {

        db.collection("appointments").where("booked", "==", false)
            .onSnapshot({ includeMetadataChanges: true }, (snapshot) => {
                this.legacyFreeSlots = snapshot.metadata.fromCache ? [] : snapshot.docs.map(doc => doc.data())
                    .filter(slot => typeof slot.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(slot.time) &&
                        Number.isInteger(slot.maxDuration) && slot.maxDuration > 0);
                this.renderPublicSlots();
                if (this.currentAdmin) this.renderAdminLists();
            }, (error) => {
                console.error("Firestore: régi szabad időpontok", error);
                this.legacyFreeSlots = [];
                this.renderPublicSlots();
                if (this.currentAdmin) this.renderAdminLists();
            });

        db.collection("schedules").onSnapshot((querySnapshot) => {
            this.schedules = [];
            querySnapshot.forEach((doc) => {
                this.schedules.push({ id: doc.id, ...doc.data() });
            });
            this.renderPublicSlots();
            if (this.currentAdmin) { this.renderAdminLists(); this.renderAdminCalendar(); }
        }, (error) => console.error("Firestore: schedules", error));

        db.collection("occupiedTimes").onSnapshot({ includeMetadataChanges: true }, (querySnapshot) => {
            this.bookingsLoaded = !querySnapshot.metadata.fromCache &&
                querySnapshot.docs.some(doc => doc.id === '_ready' && doc.data().ready === true);
            this.occupiedTimes = querySnapshot.docs.filter(doc => doc.id !== '_ready').map(doc => doc.data());
            this.renderPublicSlots();
        }, (error) => {
            console.error("Firestore: foglaltság", error);
            this.bookingsLoaded = false;
            this.renderPublicSlots();
        });

        db.collection("reviews").onSnapshot((querySnapshot) => {
            this.reviews = [];
            querySnapshot.forEach((doc) => {
                this.reviews.push({ id: doc.id, ...doc.data() });
            });
            this.renderPublicReviews();
            if(this.currentAdmin) this.renderAdminReviews();
        });

        db.collection("services").onSnapshot((querySnapshot) => {
            this.services = [];
            querySnapshot.forEach((doc) => {
                this.services.push({ id: doc.id, ...doc.data() });
            });
            if(this.currentAdmin) this.renderAdminServices();

            // Ha a foglalási ablak nyitva van és még a szolgáltatásválasztónál tart,
            // frissítsük a menüt (a szolgáltatások ugyanis aszinkron érkeznek).
            const overlay = document.getElementById('booking-modal-overlay');
            const form = document.getElementById('booking-modal-form');
            if (overlay && !overlay.classList.contains('hidden') &&
                form && form.classList.contains('hidden') && !this.pendingSelection && this.bookingDate) {
                this.renderBookingStepServices();
            }
        });

        let stopAdminBookings;
        let stopOwnBookings;
        firebase.auth().onAuthStateChanged((user) => {
            stopAdminBookings?.();
            stopOwnBookings?.();
            this.bookings = [];
            this.myAppointments = [];
            if (user) {
                if (user.email === 'admin@chrissors.hu') {
                    console.log("Admin hitelesítve, védett adatok betöltése...");

                    db.collection("users").onSnapshot((querySnapshot) => {
                        this.users = [];
                        querySnapshot.forEach((doc) => {
                            this.users.push({ id: doc.id, ...doc.data() });
                        });
                        if(this.currentAdmin) this.renderAdminLists();
                    });

                    this.currentAdmin = "Admin";
                    this.adminBookingsStatus = 'Foglalások betöltése…';
                    stopAdminBookings = db.collection("bookings").onSnapshot({ includeMetadataChanges: true }, async (snapshot) => {
                        if (snapshot.metadata.fromCache) return;
                        this.bookings = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                        this.renderAdminLists();
                        this.adminBookingsStatus = this.bookings.length
                            ? `Betöltött foglalások összesen: ${this.bookings.length}.`
                            : 'A bookings gyűjtemény üres. A régi időpontok ellenőrzése…';
                        this.renderAdminCalendar();
                        if (!snapshot.empty) return;
                        let status;
                        try {
                            const legacy = await db.collection("appointments").where("booked", "==", true).get({ source: "server" });
                            status = legacy.empty
                                ? 'A bookings és a régi appointments gyűjteményben sincs foglalás.'
                                : `A bookings üres. A régi appointments gyűjteményben ${legacy.size} foglalás van.`;
                        } catch (error) {
                            console.error("Firestore: régi időpontok", error);
                            status = 'A bookings üres. A régi időpontokat nem sikerült ellenőrizni.';
                        }
                        if (firebase.auth().currentUser?.uid !== user.uid || this.bookings.length) return;
                        this.adminBookingsStatus = status;
                        this.renderAdminCalendar();
                    }, (error) => {
                        console.error("Firestore: admin foglalások", error);
                        this.adminBookingsStatus = `A foglalások betöltése sikertelen (${error.code}).`;
                        this.renderAdminCalendar();
                    });
                    this.renderAdminLists();
                    this.renderAdminCalendar();
                    const isAtAdminUrl = window.location.hash === '#admin' || window.location.search.includes('admin');
                    if (isAtAdminUrl) this.showDashboard();
                } else {
                    db.collection("users").doc(user.uid).get().then((doc) => {
                        if (firebase.auth().currentUser?.uid !== user.uid) return;
                        if (doc.exists) {
                            const userData = { id: doc.id, ...doc.data() };
                            if (userData.status === 'approved') {
                                this.activeUser = userData;
                                this.myAppointmentsError = false;
                                
                                // Saját foglalások betöltése
                                stopOwnBookings = db.collection("bookings")
                                .where("clientUid", "==", user.uid)
                                .onSnapshot((querySnapshot) => {
                                    this.myAppointments = [];
                                    querySnapshot.forEach((doc) => { this.myAppointments.push({ id: doc.id, ...doc.data() }); });
                                    if(this.activeUser) { 
                                        this.renderUserBookings(); 
                                        this.renderHeroBookings(); 
                                        this.checkPendingReviews();
                                    }
                                }, (error) => {
                                    console.error("Firestore: saját foglalások", error);
                                    if (firebase.auth().currentUser?.uid !== user.uid) return;
                                    this.myAppointments = [];
                                    this.myAppointmentsError = true;
                                    this.renderHeroBookings();
                                });
                                
                                if (!document.getElementById('view-home').classList.contains('hidden')) {
                                    this.showHome();
                                }
                            }
                        }
                    });
                }
            } else {
                this.currentAdmin = null;
                this.activeUser = null;
                
                this.renderHeroBookings();
                if (!document.getElementById('view-home').classList.contains('hidden')) {
                    this.showHome();
                }
            }
        });

        const currentPath = window.location.pathname.toLowerCase();
        const currentSearch = window.location.search.toLowerCase();
        const currentHash = window.location.hash.toLowerCase();
        if (currentPath.includes('/admin') || currentSearch.includes('admin') || currentHash === '#admin') {
            if (!this.currentAdmin) this.showLogin();
            else this.showDashboard();
        }
    },

    toggleDrawer: function() {
        const drawer = document.getElementById('side-drawer');
        const overlay = document.getElementById('side-drawer-overlay');

        if (drawer.classList.contains('open')) {
            drawer.classList.remove('open');
            overlay.classList.add('hidden');
        } else {
            this.renderUserBookings();
            drawer.classList.add('open');
            overlay.classList.remove('hidden');
        }
    },

    renderUserBookings: function() {
        const list = document.getElementById('drawer-appointments-list');
        const userInfo = document.getElementById('drawer-user-info');
        const logoutBtn = document.getElementById('drawer-logout-btn');

        // A régi oldalsó menü (drawer) már nincs az oldalon – ilyenkor nincs mit renderelni
        if (!list || !userInfo || !logoutBtn) return;

        if (!this.activeUser) {
            userInfo.innerHTML = '<p style="color:#888;">Nincs bejelentkezett felhasználó.</p>';
            list.innerHTML = '<p style="color:#666; font-size:0.9rem;">Jelentkezz be a foglalásaid megtekintéséhez.</p>';
            logoutBtn.classList.add('hidden');
            return;
        }

        logoutBtn.classList.remove('hidden');
        userInfo.innerHTML = `Üdv, <strong style="color:var(--primary); font-size:1.0rem;">${this.activeUser.name}</strong>`;
        list.innerHTML = '';

        const myBookings = this.myAppointments.sort((a,b) => 
            new Date(`${a.date}T${a.start}:00`) - new Date(`${b.date}T${b.start}:00`)
        );

        const now = new Date();
        const upcoming = myBookings.filter(slot => {
            const apptDate = new Date(`${slot.date}T${slot.start}:00`);
            return (now - apptDate) / (1000 * 60 * 60) < 1;
        });

        if (upcoming.length === 0) {
            list.innerHTML = '<p style="color:#888; font-style:italic;">Még nincs aktív foglalásod.</p>';
        } else {
            upcoming.forEach(slot => {
                const item = document.createElement('div');
                item.className = 'drawer-appt-item';
                item.innerHTML = `
                    <div class="drawer-appt-date">${this.escapeHTML(slot.date)} &nbsp; ${this.escapeHTML(slot.start)}</div>
                    <div class="drawer-appt-loc">${this.escapeHTML(slot.location)}</div>
                `;
                list.appendChild(item);
            });
        }
    },

    renderHeroBookings: function() {
        const container = document.getElementById('hero-user-appointments');
        if (!container) return;

        if (!this.activeUser) {
            container.classList.add('hidden');
            container.innerHTML = '';
            return;
        }

        if (this.myAppointmentsError) {
            container.textContent = 'Nem sikerült betölteni az időpontjaidat.';
            container.classList.remove('hidden');
            return;
        }

        const myBookings = this.myAppointments.sort((a,b) => 
            new Date(`${a.date}T${a.start}:00`) - new Date(`${b.date}T${b.start}:00`)
        );

        const now = new Date();
        const upcoming = myBookings.filter(slot => {
            const apptDate = new Date(`${slot.date}T${slot.start}:00`);
            return (now - apptDate) / (1000 * 60 * 60) < 1;
        });

        if (upcoming.length === 0) {
            container.classList.add('hidden');
            container.innerHTML = '';
            return;
        }

        container.innerHTML = '<div style="width: 100%; text-align: center; margin-bottom: 5px;"><h3 style="color: var(--primary); font-size: 1rem; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">Általad foglalt aktív időpontok</h3></div>';
        
        upcoming.forEach(slot => {
            const formattedDate = slot.date.replace(/-/g, '.').substring(5);
            const card = document.createElement('div');
            card.className = 'hero-appt-card';
            card.innerHTML = `
                <div class="hero-appt-loc">${this.escapeHTML(slot.location)}</div>
                <div class="hero-appt-date">${this.escapeHTML(formattedDate)}</div>
                <div class="hero-appt-time">${this.escapeHTML(slot.start)}</div>
            `;
            container.appendChild(card);
        });
        container.classList.remove('hidden');
    },

    logoutUser: function() {
        firebase.auth().signOut().then(() => {
            this.activeUser = null;
            this.renderHeroBookings();
            // this.showNotification('Sikeres kijelentkezés!');
            window.location.reload();
        }).catch((error) => {
            console.error("Kijelentkezési hiba:", error);
            // this.showNotification('Hiba a kijelentkezéskor.', 'error');
        });
    },

    showNotification: function(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.5s forwards';
            setTimeout(() => { if(container.contains(toast)) container.removeChild(toast); }, 500);
        }, 3000);
    },

    selectLocation: function(loc) {
        this.currentLocation = loc;
        document.getElementById('debrecen-booking-address').classList.toggle('hidden', loc !== 'Debrecen');
        const btnFeher = document.getElementById('btn-fehergyarmat');
        const btnDebrecen = document.getElementById('btn-debrecen');
        btnFeher.classList.remove('active');
        btnDebrecen.classList.remove('active');
        if(loc === 'Fehérgyarmat') btnFeher.classList.add('active');
        else btnDebrecen.classList.add('active');
        this.renderPublicSlots();
    },

    // Admin (Foglalások tab): helyszínváltás két külön gombbal
    selectCalendarLocation: function(loc) {
        this.calendarLocation = loc;
        const btnFeher = document.getElementById('btn-cal-feher');
        const btnDebrecen = document.getElementById('btn-cal-debrecen');
        if (btnFeher) btnFeher.classList.toggle('active', loc === 'Fehérgyarmat');
        if (btnDebrecen) btnDebrecen.classList.toggle('active', loc === 'Debrecen');
        if (this.currentSelectedDateStr) this.selectCalendarDay(this.currentSelectedDateStr);
    },

    showHome: function() {
        
        this.hideAllViews();
        document.getElementById('view-home').classList.remove('hidden');

        const home = document.getElementById('view-home');
        const booking   = document.getElementById('booking-section');
        const howSec    = document.getElementById('how-section');
        const statsSec  = document.getElementById('stats-section');
        const introSec  = document.getElementById('intor-section-wrapper');
        const gallery   = document.getElementById('gallery-ribbon');
        const lightbox  = document.getElementById('lightbox');
        const reviews   = document.getElementById('reviews-section-wrapper');
        const faqSec    = document.getElementById('faq-section');

        if(this.activeUser) {
            document.getElementById('auth-buttons').classList.add('hidden');
            document.getElementById('btn-go-booking').classList.add('hidden');
            booking.classList.remove('hidden');
            this.renderHeroBookings();

            howSec.style.display = 'none';
            home.appendChild(booking);
            home.appendChild(introSec);
            home.appendChild(statsSec);
            home.appendChild(gallery);
            home.appendChild(lightbox);
            home.appendChild(reviews);
            home.appendChild(faqSec);
            
            this.renderPublicSlots();
        } else {
            document.getElementById('auth-buttons').classList.remove('hidden');
            document.getElementById('btn-go-booking').classList.add('hidden');
            document.getElementById('hero-user-appointments').classList.add('hidden');
            booking.classList.add('hidden');

            howSec.style.display = '';
            home.appendChild(howSec);
            home.appendChild(introSec);
            home.appendChild(gallery);
            home.appendChild(statsSec);
            home.appendChild(lightbox);
            home.appendChild(reviews);
            home.appendChild(faqSec);
            home.appendChild(booking);
        }
    },
    showRegister: function() { this.hideAllViews(); window.scrollTo({ top: 0, behavior: 'smooth' });document.getElementById('view-register').classList.remove('hidden'); },
    showUserLogin: function() { this.hideAllViews(); window.scrollTo({ top: 0, behavior: 'smooth' }); document.getElementById('view-user-login').classList.remove('hidden'); },
    showPriceList: function() { this.hideAllViews(); window.scrollTo({ top: 0, behavior: 'smooth' }); document.getElementById('view-price-list').classList.remove('hidden'); },
    showForgotPassword: function() { this.hideAllViews(); document.getElementById('view-forgot-password').classList.remove('hidden'); },
    showLogin: function() { this.hideAllViews(); document.getElementById('view-login').classList.remove('hidden'); },
    showDashboard: function() {
        this.hideAllViews();
        document.querySelector('header').classList.add('header-hidden');
        document.getElementById('view-dashboard').classList.remove('hidden');
        this.renderAdminLists();
        this.renderAdminCalendar();
        this.renderAdminReviews();
        this.renderAdminServices();
    },
    hideAllViews: function() {
        document.querySelector('header').classList.remove('header-hidden');
        document.querySelectorAll('body > div[id^="view-"]').forEach(el => el.classList.add('hidden'));
    },
    toggleAccordion: function(id) {
        const content = document.getElementById(id);
        const btn = document.querySelector(`button[onclick="app.toggleAccordion('${id}')"]`);
        const isOpen = content.classList.toggle('is-open');
        content.inert = !isOpen;
        btn.classList.toggle('active', isOpen);
        btn.setAttribute('aria-expanded', String(isOpen));
    },

    submitRegistration: function() {
        if(!document.getElementById('reg-gdpr').checked) {
            return this.showNotification('A regisztrációhoz el kell fogadnod a feltételeket!', 'error');
        }

        const name = document.getElementById('reg-name').value;
        const phone = document.getElementById('reg-phone').value;
        const insta = document.getElementById('reg-insta').value;
        const email = document.getElementById('reg-email').value;
        const pass = document.getElementById('reg-pass').value;

        if(!name || !phone || !insta || !email || !pass) return this.showNotification('Minden mezőt tölts ki!', 'error');

        const exists = this.users.find(u => u.insta.toLowerCase() === insta.toLowerCase() || u.name.toLowerCase() === name.toLowerCase());
        if(exists) return this.showNotification('Ezzel a névvel vagy Instagram fiókkal már regisztráltak.', 'error');

        firebase.auth().createUserWithEmailAndPassword(email, pass)
        .then((userCredential) => {
            const user = userCredential.user;
            return db.collection("users").doc(user.uid).set({
                name: name,
                phone: phone,
                insta: insta,
                email: user.email,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            firebase.auth().signOut();
            this.showNotification('Regisztráció elküldve! Várj a jóváhagyásra.', 'success');
            document.getElementById('reg-name').value = '';
            document.getElementById('reg-phone').value = '';
            document.getElementById('reg-insta').value = '';
            document.getElementById('reg-email').value = '';
            document.getElementById('reg-pass').value = '';
            this.showHome();
        })
        .catch((error) => {
            console.error("Regisztrációs hiba:", error);
            const messages = {
                'auth/email-already-in-use': 'Ez az e-mail cím már foglalt.',
                'auth/invalid-email': 'Érvénytelen e-mail cím formátum.',
                'auth/weak-password': 'A jelszó túl gyenge. Legalább 6 karakter szükséges.',
                'auth/password-does-not-meet-requirements': 'A jelszó nem felel meg a követelményeknek.',
                'auth/operation-not-allowed': 'A regisztráció jelenleg nem engedélyezett.',
                'auth/network-request-failed': 'Hálózati hiba. Ellenőrizd az internetkapcsolatod.',
            };
            const msg = messages[error.code] || 'Sikertelen regisztráció. Próbáld újra.';
            this.showNotification(msg, 'error');
        });
    },

    userLogin: function() {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-pass').value;

        if (!email || !pass) return this.showNotification('Töltsd ki a mezőket!', 'error');

        firebase.auth().signInWithEmailAndPassword(email, pass)
        .then((userCredential) => {
            const user = userCredential.user;
            return db.collection("users").doc(user.uid).get();
        })
        .then((doc) => {
            if (doc.exists) {
                const userData = { id: doc.id, ...doc.data() };

                if (userData.status === 'pending') {
                    firebase.auth().signOut();
                    this.showNotification('A regisztrációd még jóváhagyásra vár.', 'error');
                    return;
                }

                if (userData.status === 'approved') {
                    this.activeUser = userData;
                    // this.showNotification(`Sikeres belépés! Üdv, ${userData.name}`, 'success');
                    document.getElementById('login-email').value = '';
                    document.getElementById('login-pass').value = '';
                    window.location.reload();
                    this.showHome();
                    this.renderUserBookings();
                    this.renderHeroBookings();
                    this.showPriceListPopup();
                }
            } else {
                firebase.auth().signOut();
                // this.showNotification('Nincs ilyen profil.', 'error');
            }
        })
        .catch((error) => {
            console.error("Login hiba:", error);
            // Csak a tényleges bejelentkezési hibákra írjunk hibás jelszót,
            // a belépés utáni renderelési hibák ne látszódjanak hibás belépésként
            if (error && typeof error.code === 'string' && error.code.startsWith('auth/')) {
                this.showNotification('Hibás e-mail cím vagy jelszó.', 'error');
            }
        });
    },

    sendPasswordReset: function() {
        const email = document.getElementById('forgot-email').value.trim();
        if (!email) return this.showNotification('Add meg az e-mail címed!', 'error');

        firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            this.showNotification('Visszaállító link elküldve! Ellenőrizd az emailedet. (Spam-et is)', 'success');
            document.getElementById('forgot-email').value = '';
            this.showUserLogin();
        })
        .catch((error) => {
            console.error("Reset hiba:", error);
            this.showNotification('Hiba történt. Ellenőrizd az e-mail címet!', 'error');
        });
    },

    addService: function() {
        const name = document.getElementById('new-service-name').value.trim();
        const time = parseInt(document.getElementById('new-service-time').value);

        if(!name || isNaN(time) || time <= 0) return this.showNotification('Add meg a nevet és az időt helyesen!', 'error');

        db.collection("services").add({
            name: name,
            time: time,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            this.showNotification('Szolgáltatás hozzáadva.', 'success');
            document.getElementById('new-service-name').value = '';
            document.getElementById('new-service-time').value = '';
        });
    },

    deleteService: function(id) {
        if(confirm('Biztosan törlöd ezt a szolgáltatást?')) {
            db.collection("services").doc(id).delete().then(() => {
                this.showNotification('Szolgáltatás törölve.', 'success');
            });
        }
    },

    renderAdminServices: function() {
        const list = document.getElementById('list-admin-services');
        if(!list) return;
        list.innerHTML = '';

        if (this.services.length === 0) {
            list.innerHTML = '<p style="color:#666; font-style:italic;">Nincs rögzített szolgáltatás.</p>';
            return;
        }

        const sorted = this.services.slice().sort((a,b) => a.name.localeCompare(b.name));

        sorted.forEach(srv => {
            const item = document.createElement('div');
            item.className = 'dashboard-item';
            item.style.borderLeftColor = 'var(--primary)';
            item.innerHTML = `
                <div>
                    <strong style="color:white;">${this.escapeHTML(srv.name)}</strong>
                    <div style="color:#aaa; font-size: 0.85rem;">${srv.time} perc</div>
                </div>
                <div class="delete-btn" onclick="app.deleteService('${srv.id}')">Törlés</div>
            `;
            list.appendChild(item);
        });
    },

    /* ---------- Foglalási menü: a fehérlista feloldása ---------- */

    normalizeServiceName: function(str) {
        return (str || '').toString()
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();
    },

    findServiceByName: function(name) {
        const target = this.normalizeServiceName(name);
        return this.services.find(s => this.normalizeServiceName(s.name) === target) || null;
    },

    // A foglalási menü a Firestore `services` kollekcióból épül fel,
    // így új/módosított/törölt szolgáltatások automatikusan érvényesülnek.
    buildBookingMenu: function() {
        const services = this.services
            .slice()
            .sort((a, b) => {
                const ta = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
                const tb = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
                return ta - tb;
            })
            .map(srv => ({
                id: srv.id,
                name: srv.name,
                time: parseInt(srv.time) || 0
            }));

        return { services, missing: [] };
    },

    /* ---------- Felugró foglalási ablak ---------- */

    openBookingModal: function(date) {
        if (!this.activeUser) return;
        if (!this.bookingsLoaded) return;

        this.bookingDate = date;
        this.pendingSelection = null;
        this.bookingStartTime = null;
        this.selectedServiceIds = [];

        document.getElementById('booking-modal-overlay').classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        this.renderBookingStepServices();
    },

    closeBookingModal: function() {
        document.getElementById('booking-modal-overlay').classList.add('hidden');
        document.body.style.overflow = '';
        this.pendingSelection = null;
        this.bookingStartTime = null;
    },

    setBookingModalHead: function(eyebrow, title, sub) {
        document.getElementById('booking-modal-eyebrow').innerText = eyebrow;
        document.getElementById('booking-modal-title').innerText = title;
        document.getElementById('booking-modal-sub').innerText = sub || '';
    },

    formatBookingDate: function(iso) {
        const d = new Date(iso + 'T00:00:00');
        const weekday = d.toLocaleDateString('hu-HU', { weekday: 'long' });
        return `${iso.replace(/-/g, '.')} — ${weekday.charAt(0).toUpperCase() + weekday.slice(1)}`;
    },

    // 1. lépés: szolgáltatás
    renderBookingStepServices: function() {
        const step = document.getElementById('booking-modal-step');
        document.getElementById('booking-modal-form').classList.add('hidden');
        step.classList.remove('hidden');

        this.setBookingModalHead(
            'FOGLALÁS',
            'Válassz szolgáltatást',
            `${this.currentLocation} · ${this.formatBookingDate(this.bookingDate)}`
        );

        const menu = this.buildBookingMenu();

        if (menu.missing.length) {
            console.warn('[Foglalási menü] Ezek a nevek nem találhatók a Firestore `services` kollekcióban, ezért a hozzájuk tartozó csomagok kimaradnak:', menu.missing);
        }

        if (menu.services.length === 0) {
            step.innerHTML = '<div class="booking-empty">A szolgáltatások betöltése folyamatban van. Kérlek várj egy pillanatot, majd nyisd meg újra a dátumot.</div>';
            return;
        }

        this.refreshServiceSelection();
    },

    /* ---------- 1. lépés: kiválasztás (nem lép tovább azonnal) ---------- */

    // A kijelölt szolgáltatások összegzése (több is választható)
    currentSelection: function(menu) {
        const items = menu.services.filter(s => this.selectedServiceIds.indexOf(s.id) !== -1);
        if (items.length === 0) return null;

        return {
            items: items,
            total: items.reduce((sum, i) => sum + i.time, 0),
            label: items.map(i => i.name).join(', ')
        };
    },

    // Egy szolgáltatás be- vagy kikapcsolása
    toggleService: function(id) {
        const i = this.selectedServiceIds.indexOf(id);
        if (i === -1) this.selectedServiceIds.push(id);
        else this.selectedServiceIds.splice(i, 1);
        this.refreshServiceSelection();
    },

    refreshServiceSelection: function() {
        const step = document.getElementById('booking-modal-step');
        if (!step) return;
        step.innerHTML = '';
        step.appendChild(this.buildServiceSelection(this.buildBookingMenu()));
    },

    // Egy választható sor. Minden szolgáltatás négyzetes jelölést kap,
    // többet is be lehet jelölni.
    buildOptionButton: function(opts) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'booking-option'
            + (opts.isAddon ? ' booking-option--addon' : '')
            + (opts.active ? ' booking-option--active' : '');

        if (opts.dataset) {
            Object.keys(opts.dataset).forEach(k => { btn.dataset[k] = opts.dataset[k]; });
        }

        const markClass = 'booking-option-mark' + (opts.radio ? ' booking-option-mark--radio' : '');
        btn.innerHTML =
            `<span class="booking-option-main">` +
                `<span class="${markClass}">${opts.active ? '✓' : ''}</span>` +
                `<span>${this.escapeHTML(opts.label)}</span>` +
            `</span>` +
            `<span class="booking-option-time">${opts.time} perc</span>`;

        btn.onclick = opts.onClick;
        return btn;
    },

    buildServiceSelection: function(menu) {
        const wrap = document.createElement('div');
        wrap.className = 'booking-options';

        menu.services.forEach(srv => {
            wrap.appendChild(this.buildOptionButton({
                label: srv.name,
                time: srv.time,
                active: this.selectedServiceIds.indexOf(srv.id) !== -1,
                dataset: { serviceId: srv.id },
                onClick: () => this.toggleService(srv.id)
            }));
        });

        wrap.appendChild(this.buildSelectionFoot(menu));
        return wrap;
    },

    // Az összesítés és a Foglalás gomb — a lista alján
    buildSelectionFoot: function(menu) {
        const sel = this.currentSelection(menu);

        const foot = document.createElement('div');
        foot.className = 'booking-selection-foot';

        const total = document.createElement('div');
        total.className = 'booking-total';
        total.innerHTML = sel
            ? `Összesen: <strong>${sel.total} perc</strong>`
            : 'Válassz szolgáltatást';
        foot.appendChild(total);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn';
        btn.innerText = 'Foglalás';
        if (!sel) {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        }
        btn.onclick = () => { if (sel) this.confirmSelection(sel); };
        foot.appendChild(btn);

        return foot;
    },

    // A Foglalás gomb léptet tovább az időpontválasztóra
    confirmSelection: function(sel) {
        this.pendingSelection = sel;
        // Először próbáljuk meg „lyukba terelni": ha van olyan szabad rés,
        // amibe belefér a szolgáltatás, ajánljuk fel egy felugró ablakban.
        const suggestions = this.findGapSuggestions(this.bookingDate, sel.total);
        if (suggestions.length > 0) {
            this.showGapSuggestions(suggestions);
        } else {
            this.renderBookingStepTimes();
        }
    },

    // Megkeresi a szabad réseket (lyukakat), amikbe a szolgáltatás belefér,
    // és a legjobban illeszkedőket adja vissza (max 3 kezdési időpont).
    findGapSuggestions: function(date, duration) {
        const available = this.availableStartTimes(date, duration);
        if (available.length === 0) return [];
        const sched = this.schedules.find(s => s.date === date && s.location === this.currentLocation);
        if (!sched) return available.slice(0, 1);
        const startMin = this.toMin(sched.start);
        const endMin = this.toMin(sched.end);
        const dayBookings = this.occupiedTimes
            .filter(b => b.date === date && b.location === this.currentLocation)
            .sort((a, b) => this.toMin(a.start) - this.toMin(b.start));

        const gaps = [];
        let cursor = startMin;
        for (const b of dayBookings) {
            const bStart = this.toMin(b.start);
            const bEnd = this.toMin(b.end);
            if (bStart > cursor) gaps.push({ start: cursor, end: bStart });
            cursor = Math.max(cursor, bEnd);
        }
        if (cursor < endMin) gaps.push({ start: cursor, end: endMin });

        const fits = [];
        for (const g of gaps) {
            const len = g.end - g.start;
            if (len < duration) continue;
            const time = available.find(time => {
                const start = this.toMin(time);
                return start >= g.start && start + duration <= g.end;
            });
            if (time) fits.push({ time, leftover: len - duration });
        }
        fits.sort((a, b) => a.leftover - b.leftover);
        return fits.length ? fits.slice(0, 3).map(f => f.time) : available.slice(0, 1);
    },

    // Felugró ablak a lyukat kitöltő időpont-ajánlatokkal
    // (a szolgáltatásválasztóval azonos méretű és stílusú modal).
    showGapSuggestions: function(suggestions) {
        const total = this.pendingSelection ? this.pendingSelection.total : 0;

        const overlay = document.createElement('div');
        overlay.className = 'booking-modal-overlay';
        overlay.style.zIndex = '700';

        const box = document.createElement('div');
        box.className = 'booking-modal';

        const close = document.createElement('button');
        close.className = 'booking-modal-close';
        close.setAttribute('aria-label', 'Bezárás');
        close.innerHTML = '&times;';
        close.onclick = () => { overlay.remove(); this.renderBookingStepTimes(); };
        box.appendChild(close);

        const head = document.createElement('div');
        head.className = 'booking-modal-head';
        const title = document.createElement('h3');
        title.className = 'booking-modal-title';
        title.innerText = 'Találd meg a számodra megfelelő időpontot!';
        head.appendChild(title);
        const sub = document.createElement('p');
        sub.className = 'booking-modal-sub';
        sub.innerText = 'A választott szolgáltatás az alábbi időpontokban is elérhető. Válassz a felajánlott lehetőségek közül, vagy böngéssz az összes szabad időpont között.';
        head.appendChild(sub);
        box.appendChild(head);

        const list = document.createElement('div');
        list.style.cssText = 'display:flex; flex-direction:column; gap:10px;';
        suggestions.forEach(t => {
            const end = this.toTime(this.toMin(t) + total);
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'booking-time';
            btn.style.cssText = 'padding:12px; font-size:1rem; text-align:center;';
            btn.innerText = `${t} – ${end}`;
            btn.onclick = () => { overlay.remove(); this.chooseBookingTime(t); };
            list.appendChild(btn);
        });
        box.appendChild(list);

        const skip = document.createElement('button');
        skip.type = 'button';
        skip.className = 'btn btn-outline';
        skip.style.cssText = 'width:100%; margin-top:14px; padding:10px;';
        skip.innerText = 'Összes szabad időpont megtekintése';
        skip.onclick = () => { overlay.remove(); this.renderBookingStepTimes(); };
        box.appendChild(skip);

        overlay.appendChild(box);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) { overlay.remove(); this.renderBookingStepTimes(); }
        });
        document.body.appendChild(overlay);
    },

    // 2. lépés: idopontok — a szabad kezdési időpontokat az availableStartTimes adja
    findNearestFittingDate: function(fromDate, total) {
        const start = new Date(fromDate + 'T00:00:00');
        const pad = n => String(n).padStart(2, '0');

        for (let i = 1; i <= 30; i++) {
            const d = new Date(start.getTime());
            d.setDate(d.getDate() + i);
            const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
            if (this.availableStartTimes(iso, total).length > 0) return iso;
        }
        return null;
    },

    renderBookingStepTimes: function() {
        const sel = this.pendingSelection;
        const step = document.getElementById('booking-modal-step');
        const grid = this.gridSlots(this.bookingDate, sel.total);

        document.getElementById('booking-modal-form').classList.add('hidden');
        step.classList.remove('hidden');

        this.setBookingModalHead(
            'IDŐPONT',
            'Válassz időpontot',
            `${this.currentLocation} · ${this.formatBookingDate(this.bookingDate)}`
        );

        step.innerHTML = '';

        const summary = document.createElement('div');
        summary.className = 'booking-summary';
        summary.innerHTML = `Szolgáltatás: <strong>${this.escapeHTML(sel.label)}</strong> · Összidő: <strong>${sel.total} perc</strong>`;
        step.appendChild(summary);

        if (!grid.some(s => s.state === 'free')) {
            const nearest = this.findNearestFittingDate(this.bookingDate, sel.total);
            const box = document.createElement('div');
            box.className = 'booking-empty';
            box.innerHTML = nearest
                ? `Ehhez a szolgáltatáshoz (<strong>${this.escapeHTML(sel.label)}</strong>) ezen a napon már nincs szabad időpont, mert a maradék idő kevesebb, mint ${sel.total} perc.<br>A legközelebbi ilyen nap: <strong>${this.formatBookingDate(nearest)}</strong>`
                : `Ehhez a szolgáltatáshoz (<strong>${this.escapeHTML(sel.label)}</strong>) ezen a napon már nincs szabad időpont, mert a maradék idő kevesebb, mint ${sel.total} perc — és a következő 30 napban máshol sem találtunk ilyet.`;
            step.appendChild(box);

            const actions = document.createElement('div');
            actions.className = 'booking-modal-actions booking-modal-actions--empty';

            const back = document.createElement('button');
            back.className = 'btn btn-outline';
            back.style.flex = '1';
            back.innerText = 'Másik szolgáltatás';
            back.onclick = () => this.renderBookingStepServices();
            actions.appendChild(back);

            if (nearest) {
                const go = document.createElement('button');
                go.className = 'btn';
                go.style.flex = '2';
                go.innerText = 'Ugrás a legközelebbi napra';
                go.onclick = () => { this.bookingDate = nearest; this.renderBookingStepTimes(); };
                actions.appendChild(go);
            }

            step.appendChild(actions);
        }

        // Időpontok óránkénti oszlopokba rendezve (minden óra egy oszlop)
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex; gap:12px; overflow-x:auto; padding-bottom:4px;';

        const states = new Map(grid.map(slot => [slot.time, slot.state]));
        const booked = this.occupiedTimes.filter(slot =>
            slot.date === this.bookingDate && slot.location === this.currentLocation
        );
        const minutes = grid.map(slot => this.toMin(slot.time));
        booked.forEach(slot => minutes.push(this.toMin(slot.start), this.toMin(slot.end) - 1));
        const validMinutes = minutes.filter(minute => Number.isFinite(minute) && minute >= 0 && minute < 1440);
        if (!validMinutes.length) return;
        const firstHour = Math.floor(Math.min(...validMinutes) / 60);
        const lastHour = Math.floor(Math.max(...validMinutes) / 60);
        const rows = [...new Set([0, 10, 20, 30, 40, 50, ...grid.map(slot => this.toMin(slot.time) % 60)])]
            .sort((a, b) => a - b);

        for (let hour = firstHour; hour <= lastHour; hour++) {
            const col = document.createElement('div');
            col.style.cssText = 'flex:0 0 auto; display:flex; flex-direction:column; gap:7px;';

            const head = document.createElement('div');
            head.style.cssText = 'text-align:center; font-size:0.78rem; font-weight:700; color:var(--primary);';
            head.innerText = this.toTime(hour * 60);
            col.appendChild(head);

            rows.forEach(minute => {
                const start = hour * 60 + minute;
                const time = this.toTime(start);
                const state = states.get(time);
                const isBooked = booked.some(slot =>
                    start < this.toMin(slot.end) && start + 10 > this.toMin(slot.start)
                );
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'booking-time';
                btn.dataset.time = time;
                btn.style.cssText = 'padding:9px 12px; min-width:68px; text-align:center;';
                if (state === 'free') {
                    btn.onclick = () => this.chooseBookingTime(time);
                    btn.addEventListener('mouseenter', () => this.highlightRange(time, sel.total));
                    btn.addEventListener('mouseleave', () => this.clearHighlight());
                } else {
                    btn.disabled = true;
                    const reason = isBooked ? 'Foglalt' : 'Nem foglalható';
                    btn.title = reason;
                    btn.setAttribute('aria-label', `${time} · ${reason}`);
                    btn.style.opacity = isBooked ? '0.3' : '0.5';
                }
                btn.innerText = time;
                col.appendChild(btn);
            });

            wrapper.appendChild(col);
        }

        step.appendChild(wrapper);
        if (!grid.some(s => s.state === 'free')) return;

        const actions = document.createElement('div');
        actions.className = 'booking-modal-actions';

        const back = document.createElement('button');
        back.className = 'btn btn-outline';
        back.style.flex = '1';
        back.innerText = 'Vissza';
        back.onclick = () => this.renderBookingStepServices();
        actions.appendChild(back);

        step.appendChild(actions);
    },

    // A ráhúzott kezdési időpont által elfoglalt 10 perces rácsok kiemelése.
    highlightRange: function(startTime, duration) {
        const slots = Math.max(1, Math.round(duration / 10));
        const startMin = this.toMin(startTime);
        const times = [];
        for (let i = 0; i < slots; i++) {
            times.push(this.toTime(startMin + i * 10));
        }
        document.querySelectorAll('.booking-time[data-time]').forEach(btn => {
            if (times.indexOf(btn.dataset.time) !== -1) {
                btn.style.background = 'rgba(212,175,55,0.35)';
                btn.style.borderColor = 'var(--primary)';
            }
        });
    },

    clearHighlight: function() {
        document.querySelectorAll('.booking-time[data-time]').forEach(btn => {
            btn.style.background = '';
            btn.style.borderColor = '';
        });
    },

    // 3. lépés: adatok
    chooseBookingTime: function(timeStr) {
        const sel = this.pendingSelection;
        this.bookingStartTime = timeStr;
        const endStr = this.toTime(this.toMin(timeStr) + sel.total);

        document.getElementById('booking-details-display').innerText =
            `${this.currentLocation} · ${this.formatBookingDate(this.bookingDate)} · ${timeStr} – ${endStr}`;
        document.getElementById('client-phone').value = this.activeUser.phone || '';
        document.getElementById('client-email').value = this.activeUser.email || '';
        if (document.getElementById('client-note')) document.getElementById('client-note').value = '';

        this.setBookingModalHead(
            'MEGERŐSÍTÉS',
            'Foglalás véglegesítése',
            `${sel.label} · ${sel.total} perc`
        );

        document.getElementById('booking-modal-step').classList.add('hidden');
        document.getElementById('booking-modal-form').classList.remove('hidden');
    },

    bookingModalBack: function() {
        document.getElementById('booking-modal-form').classList.add('hidden');
        document.getElementById('booking-modal-step').classList.remove('hidden');
        this.renderBookingStepTimes();
    },

    saveBookingTime: function(booking, occupied, data, update = false) {
        const lock = db.collection('bookingDays').doc(`${occupied.date}_${occupied.location}`);
        const times = db.collection('occupiedTimes');
        return db.runTransaction(async transaction => {
            await transaction.get(lock);
            const day = await times.where('date', '==', occupied.date)
                .where('location', '==', occupied.location).get({ source: 'server' });
            const overlaps = day.docs.some(doc => {
                const slot = doc.data();
                return doc.id !== booking.id && occupied.start < slot.end && occupied.end > slot.start;
            });
            if (overlaps) throw new Error('booking-overlap');
            if (update) transaction.update(booking, data);
            else transaction.set(booking, data);
            transaction.set(times.doc(booking.id), occupied);
            transaction.set(lock, { changedAt: firebase.firestore.FieldValue.serverTimestamp() });
        });
    },

    submitBooking: function() {
        if (!this.bookingsLoaded) {
            return this.showNotification('A foglalhatóság jelenleg nem ellenőrizhető.', 'error');
        }
        const phone = document.getElementById('client-phone').value;
        const email = document.getElementById('client-email').value.trim();

        const cleanPhone = phone.replace(/\s+/g, '').replace(/-/g, '');
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!isEmailValid) return this.showNotification('Kérlek adj meg egy érvényes e-mail címet!', 'error');

        if (!this.pendingSelection || !this.bookingStartTime) {
            return this.showNotification('Válassz szolgáltatást és időpontot!', 'error');
        }

        const totalTime = this.pendingSelection.total;
        if (!this.availableStartTimes(this.bookingDate, totalTime).includes(this.bookingStartTime)) {
            return this.showNotification('Ez az időpont már nem foglalható.', 'error');
        }
        const selectedServices = this.pendingSelection.items.map(i => i.name);
        const servicesStr = selectedServices.join(', ');

        const start = this.bookingStartTime;
        const end = this.toTime(this.toMin(start) + totalTime);

        const userNote = document.getElementById('client-note').value.trim();
        const combinedNote = userNote ? `${servicesStr} | Megjegyzés: ${userNote}` : servicesStr;

        const booking = db.collection("bookings").doc();
        const occupied = { location: this.currentLocation, date: this.bookingDate, start, end };
        this.saveBookingTime(booking, occupied, {
            ...occupied,
            duration: totalTime,
            clientUid: firebase.auth().currentUser.uid,
            clientName: this.activeUser.name,
            clientInsta: this.activeUser.insta,
            clientPhone: cleanPhone,
            clientEmail: email,
            clientNote: combinedNote,
            services: servicesStr,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            this.closeBookingModal();
            this.showHome();
        }).catch(err => {
            console.error("Foglalási hiba:", err);
            this.showNotification(err.message === 'booking-overlap'
                ? 'Ezt az időpontot közben lefoglalták.'
                : 'Hiba történt a foglalás során. Próbáld újra!', 'error');
        });
    },

    openReviewForm: function(id) {
        this.reviewingSlotId = id;
        this.currentRating = 0;


        const stars = document.querySelectorAll('#user-stars .star');
        stars.forEach(s => { s.classList.remove('active'); s.innerText = '☆'; });
        document.getElementById('review-text').value = '';

        this.toggleDrawer();
        this.hideAllViews();
        document.getElementById('view-review-form').classList.remove('hidden');
    },

    setRating: function(rating) {
        this.currentRating = rating;
        const stars = document.querySelectorAll('#user-stars .star');
        stars.forEach((star, index) => {
            if(index < rating) {
                star.classList.add('active');
                star.innerText = '★';
            } else {
                star.classList.remove('active');
                star.innerText = '☆';
            }
        });
    },

    checkPendingReviews: function() {
        if (!this.activeUser) return;
        const now = new Date();
        const shownKey = `reviewPopupShown_${this.activeUser.id}`;
        const alreadyShown = JSON.parse(localStorage.getItem(shownKey) || '[]');
        const pending = this.myAppointments.filter(b => {
            const apptDate = new Date(`${b.date}T${b.start}:00`);
            const diffHours = (now - apptDate) / (1000 * 60 * 60);
            if (diffHours < 1) return false;
            if (alreadyShown.includes(b.id)) return false;
            return !this.reviews.some(r => r.appointmentId === b.id);
        });
        if (pending.length > 0) {
            this.showReviewPopup(pending[0].id);
            alreadyShown.push(pending[0].id);
            localStorage.setItem(shownKey, JSON.stringify(alreadyShown));
        }
    },

    showReviewPopup: function(slotId) {
        const overlay = document.getElementById('review-popup-overlay');
        overlay.classList.remove('hidden');
        overlay.dataset.slotId = slotId;
    },

    closeReviewPopup: function() {
        document.getElementById('review-popup-overlay').classList.add('hidden');
    },

    acceptReviewPopup: function() {
        const slotId = document.getElementById('review-popup-overlay').dataset.slotId;
        this.closeReviewPopup();
        this.openReviewForm(slotId);
    },

    showPriceListPopup: function() {
        const popup = document.getElementById('price-list-popup');
        if (!popup) return;

        popup.classList.remove('hidden');
        
        setTimeout(() => {
            popup.classList.add('show');
        }, 50);

        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => {
                popup.classList.add('hidden');
            }, 600);
        }, 8000);
    },

    submitReview: function() {
        const text = document.getElementById('review-text').value.trim();
        if(this.currentRating === 0) return this.showNotification('Kérlek adj meg egy csillagos értékelést!', 'error');

        if(!text) return this.showNotification('Kérlek írj egy rövid szöveges értékelést is!', 'error');
        
        db.collection("reviews").add({
            appointmentId: this.reviewingSlotId,
            userName: this.activeUser.name,
            rating: this.currentRating,
            text: text,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            this.showNotification('Köszönjük az értékelést!', 'success');
            this.reviewingSlotId = null;
            this.showHome();
        });
    },

    renderPublicReviews: function() {
        const container = document.getElementById('public-reviews-container');
        const wrapper = document.getElementById('reviews-section-wrapper');
        if(!container || !wrapper) return;

        container.innerHTML = '';
        const approved = this.reviews.filter(r => r.status === 'approved');

        if(approved.length === 0) {
            wrapper.style.display = 'none';
            return;
        }

        wrapper.style.display = 'block';

        approved.forEach(review => {
            const card = document.createElement('div');
            card.className = 'review-card';

            let starsHtml = '';
            for(let i=0; i<5; i++) {
                starsHtml += i < review.rating ? '<span class="star active" style="cursor:default">★</span>' : '<span class="star" style="cursor:default">☆</span>';
            }

            card.innerHTML = `
                <div class="review-stars">${starsHtml}</div>
                <div class="review-text">${app.escapeHTML(review.text)}</div>
                <div class="review-author">${app.escapeHTML(review.userName)}</div>
            `;
            container.appendChild(card);
        });
    },

    scrollReviews: function(direction) {
        const container = document.getElementById('public-reviews-container');
        if (!container) return;

        const cardWidth = container.querySelector('.review-card').offsetWidth + 20;

        container.scrollBy({
            left: direction * cardWidth,
            behavior: 'smooth'
        });
    },

    login: function() {
        const userInput = document.getElementById('admin-user').value.trim();
        const passInput = document.getElementById('admin-pass').value;

        if(!userInput || !passInput) return this.showNotification('Töltsd ki a mezőket!', 'error');

        firebase.auth().signInWithEmailAndPassword("admin@chrissors.hu", passInput)
        .then((userCredential) => {
            return db.collection("admins").where("name", "==", userInput).get();
        })
        .then((qs) => {
            if (!qs.empty) {
                this.currentAdmin = userInput;
                this.showNotification('Szia, főnök!', 'success');

                setTimeout(() => {
                    this.showDashboard();
                }, 100);
            } else {
                throw new Error("Nincs ilyen nevű admin az adatbázisban!");
            }
        })
        .catch((err) => {
            console.error("Login hiba:", err);
            this.showNotification('Hibás név vagy jelszó!', 'error');
        });
    },

    logout: function() {
        firebase.auth().signOut().then(() => {
            this.currentAdmin = null;
            this.showHome();
            window.location.reload();
        });
    },

    switchAdminTab: function(tab) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(`tab-${tab}`).classList.add('active');
        document.querySelectorAll('div[id^="admin-section-"]').forEach(div => div.classList.add('hidden'));
        document.getElementById(`admin-section-${tab}`).classList.remove('hidden');
        if(tab === 'bookings') this.renderAdminCalendar();
        else if (tab === 'reviews') this.renderAdminReviews();
        else if (tab === 'services') this.renderAdminServices();
        else this.renderAdminLists();
    },

    saveSchedule: function() {
        const loc = document.getElementById('new-loc').value;
        const date = document.getElementById('new-date').value;
        const startStr = document.getElementById('new-start-time').value;
        const endStr = document.getElementById('new-end-time').value;

        if (!date || !startStr || !endStr) return this.showNotification('Töltsd ki a dátumot és az időpontokat!', 'error');

        const startMin = this.toMin(startStr);
        const endMin = this.toMin(endStr);

        if (isNaN(startMin) || isNaN(endMin) || startMin >= endMin) {
            return this.showNotification('A kezdésnek a befejezés előtt kell lennie!', 'error');
        }

        const existing = this.schedules.find(s => s.date === date && s.location === loc);

        if (existing) {
            db.collection("schedules").doc(existing.id).update({
                start: startStr,
                end: endStr
            }).then(() => {
                this.showNotification('Munkaidő frissítve!', 'success');
            }).catch(err => {
                console.error("Hiba mentéskor: ", err);
                this.showNotification('Hiba történt!', 'error');
            });
        } else {
            db.collection("schedules").add({
                location: loc,
                date: date,
                start: startStr,
                end: endStr,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                this.showNotification('Munkaidő elmentve!', 'success');
            }).catch(err => {
                console.error("Hiba mentéskor: ", err);
                this.showNotification('Hiba történt!', 'error');
            });
        }
    },

    initializeOccupiedTimes: async function(button) {
        if (!this.currentAdmin || !confirm('Átvezeted a régi foglalásokat és inicializálod a foglaltsági naptárt?')) return;
        button.disabled = true;
        try {
            const bookingsRef = db.collection("bookings");
            const occupiedTimes = db.collection("occupiedTimes");
            const legacy = await db.collection("appointments").where("booked", "==", true)
                .get({ source: "server" });
            if (legacy.docs.some(doc => !doc.data().migratedBookingId)) {
                await occupiedTimes.doc('_ready').set({ ready: false });
            }
            for (const appointment of legacy.docs) {
                await db.runTransaction(async transaction => {
                    const current = await transaction.get(appointment.ref);
                    const data = current.data();
                    if (!data?.booked || data.migratedBookingId) return;

                    const { location, date, time: start, totalDuration: duration, clientUid } = data;
                    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
                        typeof start !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(start) ||
                        !Number.isInteger(duration) || duration <= 0 ||
                        this.toMin(start) + duration > 1440 ||
                        typeof location !== 'string' || !location.trim() ||
                        typeof clientUid !== 'string' || !clientUid.trim()) {
                        throw new Error(`Ellenőrizendő régi foglalás: ${appointment.id}`);
                    }
                    const booking = bookingsRef.doc(appointment.id);
                    if ((await transaction.get(booking)).exists) {
                        throw new Error(`Már létező foglalásazonosító: ${booking.id}`);
                    }
                    const occupied = { location, date, start, end: this.toTime(this.toMin(start) + duration) };
                    transaction.set(booking, {
                        ...occupied, duration, clientUid,
                        clientName: data.clientName ?? '',
                        clientEmail: data.clientEmail ?? '',
                        clientPhone: data.clientPhone ?? '',
                        clientInsta: data.clientInsta ?? '',
                        clientNote: data.clientNote ?? '',
                        services: data.services ?? '',
                        ...(data.createdAt != null && { createdAt: data.createdAt })
                    });
                    transaction.set(occupiedTimes.doc(booking.id), occupied);
                    transaction.update(appointment.ref, { migratedBookingId: booking.id });
                });
            }
            const bookings = await bookingsRef.get({ source: "server" });
            for (const booking of bookings.docs) {
                await db.runTransaction(async transaction => {
                    const current = await transaction.get(booking.ref);
                    if (!current.exists) return;
                    const { location, date, start, end } = current.data();
                    if (![location, date, start, end].every(value => typeof value === 'string' && value.length)) {
                        throw new Error(`Hiányos foglalás: ${booking.id}`);
                    }
                    transaction.set(occupiedTimes.doc(booking.id), { location, date, start, end });
                });
            }
            await occupiedTimes.doc('_ready').set({ ready: true });
            this.showNotification('A foglaltsági naptár elkészült.', 'success');
        } catch (error) {
            console.error("Foglaltsági naptár inicializálási hiba:", error);
            this.showNotification('A foglaltsági naptár inicializálása sikertelen.', 'error');
        } finally {
            button.disabled = false;
        }
    },

    deleteBooking: function(id) {
        if(confirm('Törlöd ezt a foglalást?')) {
            const batch = db.batch();
            batch.delete(db.collection("bookings").doc(id));
            batch.delete(db.collection("occupiedTimes").doc(id));
            batch.commit()
            .then(() => {
                this.showNotification('Foglalás törölve.', 'success');
                const label = document.getElementById('selected-date-label');
                if (label && label.innerText.includes('Foglalások:')) {
                    const dateStr = label.innerText.split(': ')[1];
                    this.selectCalendarDay(dateStr);
                }
            }).catch(err => {
                console.error("Hiba törléskor: ", err);
                this.showNotification('Hiba történt!', 'error');
            });
        }
    },

    deleteFreeSlot: async function(date, location, time) {
        if (!confirm(`Törlöd ezt a szabad kezdést? ${location} · ${date} · ${time}`)) return;
        try {
            const slots = await db.collection('appointments')
                .where('date', '==', date).where('location', '==', location)
                .where('time', '==', time).where('booked', '==', false)
                .get({ source: 'server' });
            await db.runTransaction(async transaction => {
                const current = await Promise.all(slots.docs.map(doc => transaction.get(doc.ref)));
                current.filter(doc => {
                    const slot = doc.data();
                    return slot?.booked === false && slot.date === date && slot.location === location && slot.time === time;
                }).forEach(doc => transaction.delete(doc.ref));
            });
            this.showNotification('A szabad kezdés eltávolítva.', 'success');
        } catch (error) {
            console.error('Szabad kezdés törlési hiba:', error);
            this.showNotification('A szabad kezdés törlése sikertelen.', 'error');
        }
    },

    deleteSchedule: async function(date, location, bookedOnly) {
        const message = bookedOnly
            ? 'Törlöd a nap összes vendégfoglalását?'
            : 'Törlöd a munkaidőt és a szabad időpontokat? A vendégfoglalások megmaradnak.';
        if (!confirm(`${date} · ${location}. ${message}`)) return;
        try {
            const [schedules, slots, bookings] = await Promise.all(['schedules', 'appointments', 'bookings'].map(collection =>
                db.collection(collection).where('date', '==', date).where('location', '==', location)
                    .get({ source: 'server' })
            ));
            if (bookedOnly && (!schedules.empty || slots.docs.some(doc => doc.data().booked === false))) {
                this.showNotification('A nap időpontjai megváltoztak. Próbáld újra.', 'error');
                return;
            }
            await db.runTransaction(async transaction => {
                const freeSlots = await Promise.all(slots.docs.filter(doc => doc.data().booked === false)
                    .map(doc => transaction.get(doc.ref)));
                const currentBookings = bookedOnly
                    ? await Promise.all(bookings.docs.map(doc => transaction.get(doc.ref)))
                    : [];
                schedules.docs.forEach(doc => transaction.delete(doc.ref));
                freeSlots.filter(doc => doc.exists && doc.data().booked === false)
                    .forEach(doc => transaction.delete(doc.ref));
                currentBookings.filter(doc => doc.exists && doc.data().date === date && doc.data().location === location)
                    .forEach(doc => {
                        transaction.delete(doc.ref);
                        transaction.delete(db.collection('occupiedTimes').doc(doc.id));
                    });
            });
            this.showNotification(bookedOnly ? 'A nap foglalásai törölve.' : 'A nap foglalhatósága törölve.', 'success');
        } catch (error) {
            console.error('Hiba a nap törlésekor:', error);
            this.showNotification('A nap törlése sikertelen.', 'error');
        }
    },

    approveUser: function(id) {
        db.collection("users").doc(id).update({ status: 'approved' })
        .then(() => this.showNotification('Felhasználó elfogadva!', 'success'));
    },

    deleteUser: function(id) {
        if(confirm('Biztosan törlöd ezt a felhasználót?')) {
            db.collection("users").doc(id).delete();
        }
    },

    renderAdminReviews: function() {
        const pendingList = document.getElementById('list-pending-reviews');
        const approvedList = document.getElementById('list-approved-reviews');
        if(!pendingList || !approvedList) return;

        pendingList.innerHTML = '';
        approvedList.innerHTML = '';

        const pending = this.reviews.filter(r => r.status === 'pending');
        const approved = this.reviews.filter(r => r.status === 'approved');

        if(pending.length === 0) pendingList.innerHTML = '<p style="color:#666; font-style:italic;">Nincs új vélemény.</p>';
        if(approved.length === 0) approvedList.innerHTML = '<p style="color:#666; font-style:italic;">Nincs még elfogadott vélemény.</p>';

        pending.forEach(r => {
            const div = document.createElement('div');
            div.className = 'dashboard-item';
            div.style.borderLeftColor = 'var(--primary)';
            div.innerHTML = `
                <div style="flex:1;">
                    <strong style="color:white;">${app.escapeHTML(r.userName)}</strong> (${app.escapeHTML(r.rating)} ★)<br>
                    <span style="color:#ccc; font-style:italic;">"${app.escapeHTML(r.text)}"</span>
                </div>
                <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end;">
                    <button type="button" class="btn btn-outline" data-review-approve style="padding:5px 10px; font-size:0.8rem;">Elfogad</button>
                    <button type="button" class="btn" data-review-edit style="padding:5px 10px; font-size:0.8rem;">Szerkesztés</button>
                    <span class="delete-btn">Törlés</span>
                </div>
            `;
            div.querySelector('[data-review-approve]').onclick = () => this.approveReviewNow(r.id);
            div.querySelector('[data-review-edit]').onclick = () => this.openAdminEditReview(r.id);
            div.querySelector('.delete-btn').onclick = () => this.deleteReview(r.id);
            pendingList.appendChild(div);
        });

        approved.forEach(r => {
            const div = document.createElement('div');
            div.className = 'dashboard-item';
            div.style.borderLeftColor = 'var(--success)';
            div.innerHTML = `
                <div style="flex:1;">
                    <strong style="color:white;">${app.escapeHTML(r.userName)}</strong> (${app.escapeHTML(r.rating)} ★)<br>
                    <span style="color:#ccc; font-style:italic;">"${app.escapeHTML(r.text)}"</span>
                </div>
                <div style="display:flex; gap:10px;">
                    <span class="delete-btn">Törlés</span>
                </div>
            `;
            div.querySelector('.delete-btn').onclick = () => this.deleteReview(r.id);
            approvedList.appendChild(div);
        });
    },

    approveReviewNow: function(id) {
        db.collection("reviews").doc(id).update({ status: 'approved' })
        .then(() => this.showNotification('Vélemény sikeresen elfogadva!', 'success'));
    },

    deleteReview: function(id) {
        if(confirm('Biztosan törlöd ezt a véleményt?')) {
            db.collection("reviews").doc(id).delete()
            .then(() => this.showNotification('Vélemény törölve.', 'success'));
        }
    },

    openAdminEditReview: function(id) {
        const review = this.reviews.find(r => r.id === id);
        if(!review) return;
        this.editingReviewId = id;
        document.getElementById('admin-review-text').value = review.text;

        this.hideAllViews();
        document.getElementById('view-admin-edit-review').classList.remove('hidden');
    },

    cancelAdminEditReview: function() {
        this.editingReviewId = null;
        this.showDashboard();
        this.switchAdminTab('reviews');
    },

    saveAndApproveReview: function() {
        const newText = document.getElementById('admin-review-text').value.trim();
        if(!this.editingReviewId) return;

        db.collection("reviews").doc(this.editingReviewId).update({
            text: newText,
            status: 'approved'
        }).then(() => {
            this.showNotification('Vélemény elfogadva és módosítva!', 'success');
            this.editingReviewId = null;
            this.showDashboard();
            this.switchAdminTab('reviews');
        });
    },

    openModifyView: function(id) {
        const b = this.bookings.find(x => x.id === id);
        if(!b) return;
        this.modifyingSlotId = id;
        document.getElementById('mod-date').value = b.date;
        document.getElementById('mod-time').value = b.start;
        document.getElementById('mod-note').value = b.clientNote || '';
        this.hideAllViews();
        document.getElementById('view-modify-booking').classList.remove('hidden');
    },

    cancelModification: function() {
        this.modifyingSlotId = null;
        this.showDashboard();
    },

    submitModification: function() {
        if(!this.modifyingSlotId) return;
        const newDate = document.getElementById('mod-date').value;
        const newTime = document.getElementById('mod-time').value;
        const newNote = document.getElementById('mod-note').value;

        if(!newDate || !newTime) return this.showNotification('Dátum és idő kötelező!', 'error');

        const b = this.bookings.find(x => x.id === this.modifyingSlotId);
        if (!b) return;
        const duration = b.duration || this.toMin(b.end) - this.toMin(b.start);
        const newEnd = this.toTime(this.toMin(newTime) + duration);

        this.saveBookingTime(db.collection("bookings").doc(b.id), {
            location: b.location, date: newDate, start: newTime, end: newEnd
        }, {
            date: newDate,
            start: newTime,
            end: newEnd,
            clientNote: newNote
        }, true)
        .then(() => {
            this.showNotification('Módosítva!', 'success');
            if(confirm("Szeretnéd SMS-ben értesíteni a vendéget?")) {
                const message = `Kedves ${b ? b.clientName : ''}! Az időpontod módosult. Új időpont: ${newDate} ${newTime}. ${newNote ? 'Megjegyzés: ' + newNote : ''} Üdv: Chrissors`;
                window.location.href = `sms:${b ? b.clientPhone : ''}?body=${encodeURIComponent(message)}`;
            }
            this.modifyingSlotId = null;
            this.showDashboard();
        }).catch(error => {
            console.error('Foglalás módosítási hiba:', error);
            this.showNotification(error.message === 'booking-overlap'
                ? 'Ez az időpont már foglalt.'
                : 'A foglalás módosítása sikertelen.', 'error');
        });
    },

    changeMonth: function(step) {
        this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + step);
        this.renderAdminCalendar();
        document.getElementById('calendar-day-details').classList.add('hidden');
    },

    renderAdminCalendar: function() {
        const grid = document.getElementById('admin-calendar-grid');
        const monthLabel = document.getElementById('calendar-month-label');
        grid.innerHTML = '';
        const year = this.currentCalendarDate.getFullYear();
        const month = this.currentCalendarDate.getMonth();
        const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
        const monthCount = this.bookings.filter(booking =>
            typeof booking.date === 'string' && booking.date.startsWith(monthPrefix)
        ).length;
        document.getElementById('admin-bookings-status').textContent = this.bookings.length
            ? `${monthCount} foglalás ebben a hónapban, ${this.bookings.length} összesen.`
            : this.adminBookingsStatus;
        const monthNames = ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"];
        monthLabel.innerText = `${year} ${monthNames[month]}`;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let firstDayIndex = new Date(year, month, 1).getDay();
        firstDayIndex = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;

        for (let i = 0; i < firstDayIndex; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'calendar-day empty';
            grid.appendChild(emptyDiv);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day';
            dayDiv.style.position = 'relative';
            const currentMonthStr = (month + 1).toString().padStart(2, '0');
            const currentDayStr = day.toString().padStart(2, '0');
            const dateStr = `${year}-${currentMonthStr}-${currentDayStr}`;
            const bookingCount = this.bookings.filter(b => b.date === dateStr).length;
            const hasSchedule = this.schedules.some(s => s.date === dateStr);
            if (hasSchedule) {
                dayDiv.style.outline = '1px solid rgba(255,255,255,0.18)';
            }

            const realToday = new Date();
            const realTodayStr = `${realToday.getFullYear()}-${(realToday.getMonth() + 1).toString().padStart(2, '0')}-${realToday.getDate().toString().padStart(2, '0')}`;

            if (dateStr === realTodayStr) {
                dayDiv.classList.add('today');
            }

            dayDiv.innerHTML = `<span>${day}</span>`;

            if (bookingCount > 0) {
                dayDiv.classList.add('has-booking');
                const badge = document.createElement('span');
                badge.innerText = bookingCount;
                badge.style.cssText = `
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    min-width: 20px;
                    height: 20px;
                    padding: 0 4px;
                    border-radius: 50%;
                    background: #888;
                    color: #fff;
                    font-size: 0.65rem;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    line-height: 1;
                    z-index: 2;
                `;
                dayDiv.appendChild(badge);
            }

            dayDiv.onclick = () => {
                document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
                dayDiv.classList.add('selected');
                app.selectCalendarDay(dateStr);
            };
            grid.appendChild(dayDiv);
        }
    },

    selectCalendarDay: function(dateStr) {
        const detailsContainer = document.getElementById('calendar-day-details');
        const label = document.getElementById('selected-date-label');
        const dayList = document.getElementById('day-list');

        const bulkContainer = document.getElementById('bulk-message-container');
        this.currentSelectedDateStr = dateStr;

        detailsContainer.classList.remove('hidden');
        label.innerText = `Foglalások: ${dateStr} · ${this.calendarLocation}`;
        dayList.innerHTML = '';

        // Az email-panel mindig látható; a gomb csak akkor aktív, ha van foglalás a napon
        if(bulkContainer) bulkContainer.style.display = 'block';
        const hasAnyBookings = this.bookings.some(b => b.date === dateStr);
        const emailBtn = document.getElementById('btn-bulk-email');
        if (emailBtn) {
            emailBtn.disabled = !hasAnyBookings;
            emailBtn.style.opacity = hasAnyBookings ? '' : '0.5';
            emailBtn.style.cursor = hasAnyBookings ? '' : 'not-allowed';
        }

        const dayBookings = this.bookings
            .filter(b => b.date === dateStr && b.location === this.calendarLocation)
            .sort((a,b) => a.start.localeCompare(b.start));

        if(dayBookings.length === 0) {
            dayList.innerHTML = '<p style="color:#666; text-align:center;">Nincs foglalás.</p>';
            return;
        }
        
        dayBookings.forEach(b => {
            // 31 napos visszatekintés a kedvezmény jelöléshez
            const slotDate = new Date(b.date);
            const past31 = new Date(b.date);
            past31.setDate(slotDate.getDate() - 31);
            
            let recentBookingCount = 0;
            if (b.clientName) {
                recentBookingCount = this.bookings.filter(x => {
                    if (x.clientName !== b.clientName) return false;
                    const d = new Date(x.date);
                    return d >= past31 && d <= slotDate;
                }).length;
            }
            
            let badgeHtml = '';
            if (recentBookingCount >= 3) {
                badgeHtml = '<span class="discount-badge">Kedvezményes</span>';
            }

            const item = document.createElement('div');
            item.className = 'dashboard-item is-booked';
            item.style.display = 'block';
            
            item.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <strong style="color:var(--primary); font-size:1.1rem;">${app.escapeHTML(b.start)} – ${app.escapeHTML(b.end)}</strong>
                        <div class="client-details">
                            ${app.escapeHTML(b.clientName)} <br>
                            <a href="tel:${String(b.clientPhone || '').replace(/[^+0-9]/g, '')}" style="color:white;">${app.escapeHTML(b.clientPhone)}</a>
                        </div>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:flex-end; gap: 4px;">
                        <span style="font-size:0.8rem; color:#aaa;">${app.escapeHTML(b.clientEmail) || 'Nincs email'}</span>
                        ${badgeHtml}
                    </div>
                </div>
                <div style="display:flex; flex-direction:column; gap:3px; align-items:flex-end; margin-top: 10px;">
                    <span class="delete-btn">Törlés</span>
                    <span class="modify-btn">Módosítás</span>
                </div>
                ${b.clientNote ? `<div class="client-note" style="margin-top: 8px;">"${app.escapeHTML(b.clientNote)}"</div>` : ''}
            `;
            
            item.querySelector('.delete-btn').onclick = () => this.deleteBooking(b.id);
            item.querySelector('.modify-btn').onclick = () => this.openModifyView(b.id);
            dayList.appendChild(item);
        });
    },

sendBulkEmail: function() {
    if (!this.currentSelectedDateStr) return;
    const dateStr = this.currentSelectedDateStr;
    const dayBookings = this.bookings.filter(b => b.date === dateStr);

    const emails = [...new Set(dayBookings.map(b => (b.clientEmail || '').trim()).filter(Boolean))];

    if (emails.length === 0) {
        return this.showNotification('Nincs elérhető email-cím ezen a napon.', 'error');
    }

    const subject = 'Chrissors – Időpont-emlékeztető';
    const formattedDate = this.formatBookingDate(dateStr);
    const bodyText = `Kedves Vendégem!\n\nSzeretettel várlak a lefoglalt időpontodra: ${formattedDate}.\n\nHa közbejött valami, kérlek, jelezd minél hamarabb!\n\nÜdvözlettel:\nKrisztián`;

    const compose = new URL('https://mail.google.com/mail/');
    compose.search = new URLSearchParams({
        view: 'cm',
        fs: '1',
        to: emails.join(','),
        su: subject,
        body: bodyText
    }).toString();
    window.open(compose.href, '_blank', 'noopener,noreferrer');
    },

    renderAdminLists: function() {
        const listFeher = document.getElementById('list-manage-feher');
        const listDebrecen = document.getElementById('list-manage-debrecen');
        if (listFeher) listFeher.innerHTML = '';
        if (listDebrecen) listDebrecen.innerHTML = '';
        let counts = { mf: 0, md: 0 };

        const renderLocation = (container, loc) => {
            if (!container) return;
            const schedules = new Map(this.schedules.filter(s => s.location === loc).map(s => [s.date, s]));
            const dates = [...new Set([
                ...schedules.keys(),
                ...this.legacyFreeSlots.filter(s => s.location === loc).map(s => s.date),
                ...this.bookings.filter(b => b.location === loc).map(b => b.date)
            ])].filter(date => typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)).sort();

            if (dates.length === 0) {
                container.innerHTML = '<p style="color:#666; font-style:italic; padding:10px;">Nincs rögzített időpont.</p>';
                return;
            }

            dates.forEach(date => {
                const schedule = schedules.get(date);
                const bookings = this.bookings
                    .filter(b => b.location === loc && b.date === date)
                    .sort((a, b) => a.start.localeCompare(b.start));
                const legacyTimes = [...new Set(this.legacyFreeSlots
                    .filter(slot => slot.location === loc && slot.date === date)
                    .map(slot => slot.time))].sort();

                const dateObj = new Date(date + 'T00:00:00');
                const dayName = dateObj.toLocaleDateString('hu-HU', { weekday: 'long' });
                const formattedDate = date.replace(/-/g, '.').substring(5);

                const dayWrapper = document.createElement('div');
                dayWrapper.className = 'day-group';
                dayWrapper.style.marginBottom = '8px';

                const header = document.createElement('div');
                header.className = 'day-header';
                header.style.cursor = 'pointer';
                header.innerHTML = `
                    <span>${formattedDate} – ${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${schedule ? `<span style="color:#888; font-weight:normal;">(${app.escapeHTML(schedule.start)}–${app.escapeHTML(schedule.end)})</span>` : ''}</span>
                    <div style="display:flex; align-items:center; gap: 15px;">
                        <span style="font-size:0.8rem; color:#888;">${legacyTimes.length + bookings.length} időpont – <span style="color:var(--danger);">${bookings.length} foglalt</span></span>
                    </div>
                `;
                if (schedule || legacyTimes.length || bookings.length) {
                    const deleteButton = document.createElement('button');
                    deleteButton.type = 'button';
                    deleteButton.className = 'delete-day-btn';
                    deleteButton.textContent = 'Törlés';
                    deleteButton.onclick = event => {
                        event.stopPropagation();
                        this.deleteSchedule(date, loc, !schedule && !legacyTimes.length);
                    };
                    header.lastElementChild.appendChild(deleteButton);
                }

                const slotsDiv = document.createElement('div');
                slotsDiv.style.cssText = 'display:none; flex-direction:column; gap:8px; padding:12px 16px; background:transparent; border-top:1px solid #333;';

                if (!bookings.length && !legacyTimes.length) {
                    slotsDiv.innerHTML = '<p style="color:#666; font-style:italic;">Nincs időpont erre a napra.</p>';
                }

                const entries = [...bookings, ...legacyTimes.map(start => ({ start }))]
                    .sort((a, b) => a.start.localeCompare(b.start));
                entries.forEach(b => {
                    const item = document.createElement('div');
                    item.className = 'dashboard-item';
                    item.style.cssText = 'margin:0; border-radius:4px;';
                    const deleteButton = document.createElement('button');
                    deleteButton.type = 'button';
                    deleteButton.className = 'delete-btn';
                    deleteButton.style.cssText = 'border:0; background:transparent; font:inherit; font-weight:bold;';
                    deleteButton.textContent = 'Törlés';
                    if (!b.id) {
                        const start = this.toMin(b.start);
                        const overlaps = bookings.some(booking =>
                            start < this.toMin(booking.end) && start + 10 > this.toMin(booking.start)
                        );
                        const label = document.createElement('span');
                        label.textContent = `${b.start} · ${schedule || overlaps ? 'Régi szabad idősáv, nem aktív' : 'Szabad kezdés'}`;
                        item.appendChild(label);
                        deleteButton.onclick = () => this.deleteFreeSlot(date, loc, b.start);
                    } else {
                        item.style.borderLeftColor = 'var(--danger)';
                        item.innerHTML = `
                        <div>
                            <span style="color:#fff; font-weight:bold;">${app.escapeHTML(b.start)} – ${app.escapeHTML(b.end)}</span>
                            <span style="color:var(--danger); margin-left:8px; font-size:0.8rem;">[${app.escapeHTML(b.clientName || '')} – ${app.escapeHTML(b.services || '')}]</span>
                        </div>
                        `;
                        deleteButton.onclick = () => this.deleteBooking(b.id);
                    }
                    item.appendChild(deleteButton);
                    slotsDiv.appendChild(item);
                });

                header.onclick = () => {
                    const isOpen = slotsDiv.style.display === 'flex';
                    slotsDiv.style.display = isOpen ? 'none' : 'flex';
                    header.style.background = isOpen ? '' : '#252525';
                };

                dayWrapper.appendChild(header);
                dayWrapper.appendChild(slotsDiv);
                container.appendChild(dayWrapper);

                if (loc === 'Fehérgyarmat') counts.mf++; else counts.md++;
            });
        };

        renderLocation(listFeher, 'Fehérgyarmat');
        renderLocation(listDebrecen, 'Debrecen');

        document.getElementById('count-manage-feher').innerText = counts.mf;
        document.getElementById('count-manage-debrecen').innerText = counts.md;

        const pendingList = document.getElementById('list-pending-users');
        if(pendingList) {
            pendingList.innerHTML = '';
            const pendingUsers = this.users.filter(u => u.status === 'pending');
            if(pendingUsers.length === 0) pendingList.innerHTML = '<p style="color:#666; font-style:italic;">Nincs új jelentkező.</p>';
            pendingUsers.forEach(u => {
                const div = document.createElement('div');
                div.className = 'dashboard-item';
                div.style.borderLeftColor = 'var(--primary)';
                div.innerHTML = `<div><strong style="color:white;">${app.escapeHTML(u.name)}</strong> <br><span style="color:var(--primary);">${app.escapeHTML(u.insta)}</span></div><div style="display:flex; gap:10px;"><button class="btn" style="padding:5px 10px; font-size:0.8rem;" onclick="app.approveUser('${u.id}')">Elfogadás</button><span class="delete-btn" onclick="app.deleteUser('${u.id}')">X</span></div>`;
                pendingList.appendChild(div);
            });
        }

        const approvedList = document.getElementById('list-approved-users');
        if(approvedList) {
            approvedList.innerHTML = '';
            const approvedUsers = this.users.filter(u => u.status === 'approved');
            if(document.getElementById('count-approved-users')) document.getElementById('count-approved-users').innerText = approvedUsers.length;

            const term = this.normalizeSearchText(this.userSearchTerm);
            const visibleUsers = term
                ? approvedUsers.filter(u => this.normalizeSearchText(u.name).includes(term))
                : approvedUsers;

            if(term && visibleUsers.length === 0) {
                approvedList.innerHTML = '<p style="color:#666; font-style:italic;">Nincs a keresésnek megfelelő vendég.</p>';
            }

            visibleUsers.forEach(u => {
                const div = document.createElement('div');
                div.className = 'dashboard-item';
                div.style.borderLeftColor = 'var(--success)';
                div.innerHTML = `<div><strong style="color:white;">${app.escapeHTML(u.name)}</strong> <br><span style="color:#777;">${app.escapeHTML(u.insta)}</span></div><span class="delete-btn" onclick="app.deleteUser('${u.id}')">Törlés</span>`;
                approvedList.appendChild(div);
            });
        }
    },

    normalizeSearchText: function(text) {
        return (text || '')
            .toString()
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    },

    filterApprovedUsers: function(value) {
        this.userSearchTerm = value;
        this.renderAdminLists();
    },

    renderPublicSlots: function() {
        const container = document.getElementById('slots-container');
        const msg = document.getElementById('no-slots-msg');
        container.innerHTML = '';
        msg.textContent = this.bookingsLoaded
            ? 'Jelenleg nincs szabad időpont.'
            : 'A foglalhatóság jelenleg nem ellenőrizhető.';
        if (!this.bookingsLoaded) {
            msg.style.display = 'block';
            return;
        }

        const dates = new Set();
        [...this.schedules, ...this.legacyFreeSlots].forEach(s => {
            if (s.location !== this.currentLocation) return;
            if (this.availableStartTimes(s.date, 10).length > 0) dates.add(s.date);
        });

        const sorted = Array.from(dates).sort();

        if (sorted.length === 0) {
            msg.style.display = 'block';
            return;
        }

        msg.style.display = 'none';

        sorted.forEach(date => {
            const dateObj = new Date(date + 'T00:00:00');
            const weekday = dateObj.toLocaleDateString('hu-HU', { weekday: 'short' }).replace(/\.$/, '');
            const month = dateObj.toLocaleDateString('hu-HU', { month: 'short' });

            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'day-card';
            card.innerHTML = `
                <span class="day-card-weekday">${weekday}</span>
                <span class="day-card-day">${dateObj.getDate()}</span>
                <span class="day-card-month">${month}</span>
            `;
            card.onclick = () => app.openBookingModal(date);

            container.appendChild(card);
        });
    }
};

app.init();

// Loading screen kezelése: pontosan 2 másodperc animáció + fade out
document.body.classList.add('loading-active');


/* =====================================================
   BELÉPTETŐ ANIMÁCIÓK — görgetésre megjelenő elemek
   ===================================================== */
(function () {
if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal, .form-box, .time-slot').forEach(function(el) {
        el.classList.add('visible');
    });
    return;
}

var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

var revealConfigs = [
    { sel: '.stat-item', variant: 'reveal-scale' },
    { sel: '.intro-section', variant: 'reveal' },
    { sel: '.intro-section h2', variant: 'reveal-left' },
    { sel: '.intro-section p', variant: 'reveal-right' },
    { sel: '.section-divider span', variant: 'reveal-line' },
    { sel: '.gallery-ribbon-container', variant: 'reveal' },
    { sel: '.reviews-section h2', variant: 'reveal' },
    { sel: '#booking-section h2', variant: 'reveal' },
    { sel: '.location-selector', variant: 'reveal-scale' },
    { sel: '.day-group', variant: 'reveal' },
    { sel: 'footer', variant: 'reveal' },
    { sel: '.faq-intro', variant: 'reveal-left' },
    { sel: '.dashboard-box', variant: 'reveal' },
    { sel: '.accordion-btn', variant: 'reveal' },
    { sel: '.dashboard-item', variant: 'reveal' },
];

revealConfigs.forEach(function(cfg) {
    document.querySelectorAll(cfg.sel).forEach(function(el) {
        el.classList.add(cfg.variant);
        revealObserver.observe(el);
    });
});

// Alternating left/right for card-style groups
document.querySelectorAll('.review-card').forEach(function(el, i) {
    el.classList.add(i % 2 === 0 ? 'reveal-left' : 'reveal-right');
    revealObserver.observe(el);
});
document.querySelectorAll('.faq-item').forEach(function(el, i) {
    el.classList.add('reveal-right');
    revealObserver.observe(el);
});

// Review cards render dynamically after data loads, so watch for them too
var reviewsTrackEl = document.querySelector('.reviews-track');
if (reviewsTrackEl) {
    var reviewMutationObserver = new MutationObserver(function() {
        var cards = reviewsTrackEl.querySelectorAll('.review-card:not(.reveal-left):not(.reveal-right)');
        cards.forEach(function(el, i) {
            el.classList.add(i % 2 === 0 ? 'reveal-left' : 'reveal-right');
            revealObserver.observe(el);
        });
    });
    reviewMutationObserver.observe(reviewsTrackEl, { childList: true });
}

var easeOut = function(t) { return 1 - Math.pow(1 - t, 3); };

function animateCounter(el) {
    var target = parseInt(el.dataset.target, 10);
    var suffix = el.dataset.suffix || '';
    var duration = target >= 100 ? 1800 : 1200;
    var start = performance.now();
    function tick(now) {
        var progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(easeOut(progress) * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

var statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.stat-num').forEach(function(el, i) {
                setTimeout(function() { animateCounter(el); }, i * 200);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.4 });

var statsSection = document.getElementById('stats-section');
if (statsSection) statsObserver.observe(statsSection);
})();

