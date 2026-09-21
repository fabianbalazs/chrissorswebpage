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
function smoothScrollTo(targetId, duration) {
    var target = document.getElementById(targetId);
    if (!target) return;
    duration = duration || 1100;
    var startY = window.pageYOffset;
    var targetY = target.getBoundingClientRect().top + startY;
    var distance = targetY - startY;
    var startTime = null;

    function easeInOutQuart(t) {
        return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
    }

    function step(currentTime) {
        if (startTime === null) startTime = currentTime;
        var elapsed = currentTime - startTime;
        var progress = Math.min(elapsed / duration, 1);
        window.scrollTo(0, startY + distance * easeInOutQuart(progress));
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}


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

const app = {
    data: [],
    myAppointments: [],
    users: [],
    reviews: [],
    services: [], 

    currentAdmin: null,
    activeUser: null,
    currentLocation: 'Fehérgyarmat',
    bookingSlotId: null,
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

    init: function() {

        db.collection("appointments").where("booked", "==", false).onSnapshot((querySnapshot) => {
            if (!this.currentAdmin && !this.activeUser) {
                this.data = [];
                querySnapshot.forEach((doc) => {
                    this.data.push({ id: doc.id, ...doc.data() });
                });
                this.renderPublicSlots();
            }
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
        });

        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                if (user.email === 'admin@chrissors.hu') {
                    console.log("Admin hitelesítve, védett adatok betöltése...");
                    
                    db.collection("appointments").onSnapshot((querySnapshot) => {
                        this.data = [];
                        querySnapshot.forEach((doc) => { this.data.push({ id: doc.id, ...doc.data() }); });
                        this.renderPublicSlots();
                        if(this.currentAdmin) { this.renderAdminLists(); this.renderAdminCalendar(); }
                    });

                    db.collection("users").onSnapshot((querySnapshot) => {
                        this.users = [];
                        querySnapshot.forEach((doc) => {
                            this.users.push({ id: doc.id, ...doc.data() });
                        });
                        if(this.currentAdmin) this.renderAdminLists();
                    });

                    this.currentAdmin = "Admin";
                    const isAtAdminUrl = window.location.hash === '#admin' || window.location.search.includes('admin');
                    if (isAtAdminUrl) this.showDashboard();
                } else {
                    db.collection("users").doc(user.uid).get().then((doc) => {
                        if (doc.exists) {
                            const userData = { id: doc.id, ...doc.data() };
                            if (userData.status === 'approved') {
                                this.activeUser = userData;
                                
                                // 1. LEKÉRDEZÉS: Csak a szabad időpontok (ebben nincs személyes adat)
                                db.collection("appointments").where("booked", "==", false).onSnapshot((querySnapshot) => {
                                    this.data = [];
                                    querySnapshot.forEach((doc) => { this.data.push({ id: doc.id, ...doc.data() }); });
                                    this.renderPublicSlots();
                                });

                                // 2. LEKÉRDEZÉS: Csak a saját, lefoglalt időpontok
                                db.collection("appointments")
                                .where("booked", "==", true)
                                .where("clientUid", "==", user.uid)
                                .onSnapshot((querySnapshot) => {
                                    this.myAppointments = [];
                                    querySnapshot.forEach((doc) => { this.myAppointments.push({ id: doc.id, ...doc.data() }); });
                                    if(this.activeUser) { 
                                        this.renderUserBookings(); 
                                        this.renderHeroBookings(); 
                                    }
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
            new Date(`${a.date}T${a.time}:00`) - new Date(`${b.date}T${b.time}:00`)
        );

        const now = new Date();
        const upcoming = myBookings.filter(slot => {
            const apptDate = new Date(`${slot.date}T${slot.time}:00`);
            return (now - apptDate) / (1000 * 60 * 60) < 1;
        });

        if (upcoming.length === 0) {
            list.innerHTML = '<p style="color:#888; font-style:italic;">Még nincs aktív foglalásod.</p>';
        } else {
            upcoming.forEach(slot => {
                const item = document.createElement('div');
                item.className = 'drawer-appt-item';
                item.innerHTML = `
                    <div class="drawer-appt-date">${slot.date} &nbsp; ${slot.time}</div>
                    <div class="drawer-appt-loc">${slot.location}</div>
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

        const myBookings = this.myAppointments.sort((a,b) => 
            new Date(`${a.date}T${a.time}:00`) - new Date(`${b.date}T${b.time}:00`)
        );

        const now = new Date();
        const upcoming = myBookings.filter(slot => {
            const apptDate = new Date(`${slot.date}T${slot.time}:00`);
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
                <div class="hero-appt-loc">${slot.location}</div>
                <div class="hero-appt-date">${formattedDate}</div>
                <div class="hero-appt-time">${slot.time}</div>
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
        const btnFeher = document.getElementById('btn-fehergyarmat');
        const btnDebrecen = document.getElementById('btn-debrecen');
        btnFeher.classList.remove('active');
        btnDebrecen.classList.remove('active');
        if(loc === 'Fehérgyarmat') btnFeher.classList.add('active');
        else btnDebrecen.classList.add('active');
        this.renderPublicSlots();
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
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
            content.style.overflow = 'hidden';
            btn.classList.remove('active');
        } else {
            content.style.maxHeight = '9999px';
            content.style.overflow = 'visible';
            btn.classList.add('active');
        }
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
                email: email,
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
                    this.checkPendingReviews();
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

        const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

        const userRecord = this.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());

        if (userRecord) {
            const lastReset = userRecord.lastPasswordReset;
            if (lastReset) {
                const lastResetDate = lastReset.toDate ? lastReset.toDate() : new Date(lastReset);
                const elapsed = Date.now() - lastResetDate.getTime();
                if (elapsed < TWO_WEEKS_MS) {
                    const daysLeft = Math.ceil((TWO_WEEKS_MS - elapsed) / (24 * 60 * 60 * 1000));
                    return this.showNotification(`Jelszót legkorábban ${daysLeft} nap múlva változtathatsz újra.`, 'error');
                }
            }

            db.collection("users").doc(userRecord.id).update({
                lastPasswordReset: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

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

    renderBookingServices: function() {
        const container = document.getElementById('booking-services-container');
        container.innerHTML = '';
        
        if (this.services.length === 0) {
            container.innerHTML = '<p style="color:#aaa; font-style:italic; font-size: 0.9rem;">Nincsenek elérhető szolgáltatások.</p>';
        } else {
            const sorted = this.services.slice().sort((a,b) => a.name.localeCompare(b.name));
            sorted.forEach(srv => {
                const label = document.createElement('label');
                label.className = 'service-check-label';
                label.innerHTML = `
                    <input type="checkbox" value="${srv.id}" data-time="${srv.time}" onchange="app.calcBookingTime()">
                    <span>${this.escapeHTML(srv.name)} <span style="color:var(--primary);">(${srv.time} perc)</span></span>
                `;
                container.appendChild(label);
            });
        }
        this.calcBookingTime();
    },

    calcBookingTime: function() {
        let total = 0;
        const checkboxes = document.querySelectorAll('#booking-services-container input[type="checkbox"]:checked');
        checkboxes.forEach(cb => total += parseInt(cb.dataset.time));

        const slot = this.data.find(x => x.id === this.bookingSlotId);
        const max = (slot && slot.maxDuration) ? slot.maxDuration : 60; 

        const display = document.getElementById('booking-time-display');
        display.innerText = `Összidő: ${total} perc (Max: ${max} perc)`;

        const submitBtn = document.getElementById('btn-submit-booking');

        if (total > max) {
            display.style.color = 'var(--danger)';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
            submitBtn.style.cursor = 'not-allowed';
        } else if (total === 0) {
            display.style.color = 'var(--text-gray)';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
            submitBtn.style.cursor = 'not-allowed';
        } else {
            display.style.color = 'var(--primary)';
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        }
    },

    startBooking: function(id) {
        const slot = this.data.find(x => x.id === id);
        if(slot) {
            this.bookingSlotId = id;
            document.getElementById('booking-details-display').innerText = `${slot.location} - ${slot.date} ${slot.time}`;
            document.getElementById('client-phone').value = this.activeUser.phone || '';
            document.getElementById('client-email').value = this.activeUser.email || '';

            if(document.getElementById('client-note')) document.getElementById('client-note').value = '';
            
            this.renderBookingServices();

            this.hideAllViews();
            document.getElementById('view-booking-form').classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    submitBooking: function() {
        const phone = document.getElementById('client-phone').value;
        const email = document.getElementById('client-email').value.trim();

        const cleanPhone = phone.replace(/\s+/g, '').replace(/-/g, '');
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!isEmailValid) return this.showNotification('Kérlek adj meg egy érvényes e-mail címet!', 'error');

        const checkboxes = Array.from(document.querySelectorAll('#booking-services-container input[type="checkbox"]:checked'));
        if(checkboxes.length === 0) return this.showNotification('Válassz legalább egy szolgáltatást!', 'error');

        let totalTime = 0;
        let selectedServices = [];
        checkboxes.forEach(cb => {
            totalTime += parseInt(cb.dataset.time);
            selectedServices.push(cb.nextElementSibling.textContent.trim().split(' (')[0]);
        });

        const slot = this.data.find(x => x.id === this.bookingSlotId);
        const maxAllowed = slot.maxDuration || 60;
        
        if(totalTime > maxAllowed) return this.showNotification(`Maximum ${maxAllowed} percet foglalhatsz ide!`, 'error');

        const servicesStr = selectedServices.join(', ');

        const userNote = document.getElementById('client-note').value.trim();
        const combinedNote = userNote ? `${servicesStr} | Megjegyzés: ${userNote}` : servicesStr;

        if(this.bookingSlotId) {
            let promises = [];

            let updatePromise = db.collection("appointments").doc(this.bookingSlotId).update({
                booked: true,
                clientUid: firebase.auth().currentUser.uid, 
                clientName: this.activeUser.name,
                clientInsta: this.activeUser.insta,
                clientPhone: cleanPhone,
                clientEmail: email,
                clientNote: combinedNote, 
                services: servicesStr, 
                totalDuration: totalTime
            });

            promises.push(updatePromise);

            if (totalTime <= 30 && maxAllowed === 60) {
                let currentH = parseInt(slot.time.split(':')[0]);
                let currentM = parseInt(slot.time.split(':')[1]);

                let newM = currentM + totalTime;
                let newH = currentH;
                if(newM >= 60) {
                    newH += Math.floor(newM / 60);
                    newM = newM % 60;
                }
                
                let newTimeStr = newH.toString().padStart(2, '0') + ':' + newM.toString().padStart(2, '0');
                let newMaxDuration = 60 - totalTime;

                let insertPromise = db.collection("appointments").add({
                    location: slot.location,
                    date: slot.date,
                    time: newTimeStr,
                    booked: false,
                    maxDuration: newMaxDuration,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                promises.push(insertPromise);
            }

            Promise.all(promises).then(() => {
                // this.showNotification('Sikeres foglalás!', 'success');
                this.bookingSlotId = null;
                this.showHome();
            });
        }
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
        const pending = this.data.filter(slot => {
            if (!slot.booked) return false;
            if (slot.clientName !== this.activeUser.name) return false;
            if (slot.clientInsta !== this.activeUser.insta) return false;
            const apptDate = new Date(`${slot.date}T${slot.time}:00`);
            const diffHours = (now - apptDate) / (1000 * 60 * 60);
            if (diffHours < 1) return false;
            if (alreadyShown.includes(slot.id)) return false;
            return !this.reviews.some(r => r.appointmentId === slot.id);
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

    addSlot: function() {
        const loc = document.getElementById('new-loc').value;
        const date = document.getElementById('new-date').value;
        const startStr = document.getElementById('new-start-time').value; 
        const endStr = document.getElementById('new-end-time').value; 

        if(!date || !startStr || !endStr) return this.showNotification('Töltsd ki a dátumot és az órákat!', 'error');

        const startH = parseInt(startStr.split(':')[0]);
        const endH = parseInt(endStr.split(':')[0]);

        if (isNaN(startH) || isNaN(endH) || startH > endH) {
            return this.showNotification('Érvénytelen időintervallum!', 'error');
        }

        const batch = db.batch();

        for(let h = startH; h <= endH; h++) {
            let timeStr = h.toString().padStart(2, '0') + ':00';
            let docRef = db.collection("appointments").doc();
            
            batch.set(docRef, {
                location: loc,
                date: date,
                time: timeStr,
                booked: false,
                maxDuration: 60, 
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        batch.commit().then(() => {
            this.showNotification('Időpontok sikeresen generálva!', 'success');
            document.getElementById('new-date').value = '';
            document.getElementById('new-start-time').value = '';
            document.getElementById('new-end-time').value = '';
        }).catch(err => {
            console.error("Hiba generáláskor: ", err);
            this.showNotification('Hiba történt!', 'error');
        });
    },

    addSingleSlot: function() {
        const loc = document.getElementById('single-loc').value;
        const date = document.getElementById('single-date').value;
        const time = document.getElementById('single-time').value;

        if(!date || !time) return this.showNotification('Töltsd ki a dátumot és az időpontot!', 'error');

        db.collection("appointments").add({
            location: loc,
            date: date,
            time: time,
            booked: false,
            maxDuration: 60, 
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            this.showNotification('Egyedi időpont sikeresen hozzáadva!', 'success');

            document.getElementById('single-time').value = '';
        }).catch(err => {
            console.error("Hiba generáláskor: ", err);
            this.showNotification('Hiba történt!', 'error');
        });
    },

    deleteSlot: function(id) {
        if(confirm('Törlöd az időpontot?')) {
            db.collection("appointments").doc(id).delete()
            .then(() => {
                this.showNotification('Törölve.', 'success');
                const label = document.getElementById('selected-date-label').innerText;
                if(label.includes('Foglalások:')) {
                    const dateStr = label.split(': ')[1];
                    this.selectCalendarDay(dateStr);
                }
            });
        }
    },
    
    // ÚJ FÜGGVÉNY: Teljes nap törlése
    deleteDay: function(e, date, loc) {
        e.stopPropagation(); // Ne nyissa le/csukja be az egész napot
        
        if(confirm(`Biztosan törlöd a(z) ${date} naphoz tartozó összes ${loc}i időpontot? Ezzel minden foglalás elvész!`)) {
            const slotsToDelete = this.data.filter(s => s.date === date && s.location === loc);
            if (slotsToDelete.length === 0) return;

            const batch = db.batch();
            slotsToDelete.forEach(slot => {
                const docRef = db.collection("appointments").doc(slot.id);
                batch.delete(docRef);
            });

            batch.commit().then(() => {
                this.showNotification('A nap összes időpontja törölve.', 'success');
            }).catch(err => {
                console.error("Hiba a nap törlésekor: ", err);
                this.showNotification('Hiba történt a törlés során!', 'error');
            });
        }
    },

    republishSlot: function(id) {
        if(confirm('Biztosan felszabadítod ezt az időpontot? A vendég adatai törlődnek, és az időpont újra foglalható lesz.')) {
            db.collection("appointments").doc(id).update({
                booked: false,
                clientName: firebase.firestore.FieldValue.delete(),
                clientInsta: firebase.firestore.FieldValue.delete(),
                clientPhone: firebase.firestore.FieldValue.delete(),
                clientEmail: firebase.firestore.FieldValue.delete(),
                clientNote: firebase.firestore.FieldValue.delete(),
                services: firebase.firestore.FieldValue.delete(),
                totalDuration: firebase.firestore.FieldValue.delete()
            })
            .then(() => {
                this.showNotification('Időpont újra meghirdetve!', 'success');

                const label = document.getElementById('selected-date-label').innerText;
                if(label.includes('Foglalások:')) {
                    const dateStr = label.split(': ')[1];
                    this.selectCalendarDay(dateStr);
                }
            })
            .catch(err => {
                console.error("Hiba az újrahirdetéskor:", err);
                this.showNotification('Hiba történt!', 'error');
            });
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
                    <strong style="color:white;">${app.escapeHTML(r.userName)}</strong> (${r.rating} ★)<br>
                    <span style="color:#ccc; font-style:italic;">"${app.escapeHTML(r.text)}"</span>
                </div>
                <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end;">
                    <button class="btn btn-outline" style="padding:5px 10px; font-size:0.8rem;" onclick="app.approveReviewNow('${r.id}')">Elfogad</button>
                    <button class="btn" style="padding:5px 10px; font-size:0.8rem;" onclick="app.openAdminEditReview('${r.id}')">Szerkesztés</button>
                    <span class="delete-btn" onclick="app.deleteReview('${r.id}')">Törlés</span>
                </div>
            `;
            pendingList.appendChild(div);
        });

        approved.forEach(r => {
            const div = document.createElement('div');
            div.className = 'dashboard-item';
            div.style.borderLeftColor = 'var(--success)';
            div.innerHTML = `
                <div style="flex:1;">
                    <strong style="color:white;">${app.escapeHTML(r.userName)}</strong> (${r.rating} ★)<br>
                    <span style="color:#ccc; font-style:italic;">"${app.escapeHTML(r.text)}"</span>
                </div>
                <div style="display:flex; gap:10px;">
                    <span class="delete-btn" onclick="app.deleteReview('${r.id}')">Törlés</span>
                </div>
            `;
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
        const slot = this.data.find(x => x.id === id);
        if(!slot) return;
        this.modifyingSlotId = id;
        document.getElementById('mod-date').value = slot.date;
        document.getElementById('mod-time').value = slot.time;
        document.getElementById('mod-note').value = slot.clientNote || '';
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

        const slot = this.data.find(x => x.id === this.modifyingSlotId);

        db.collection("appointments").doc(this.modifyingSlotId).update({
            date: newDate,
            time: newTime,
            clientNote: newNote
        })
        .then(() => {
            this.showNotification('Módosítva!', 'success');
            if(confirm("Szeretnéd SMS-ben értesíteni a vendéget?")) {
                const message = `Kedves ${slot.clientName}! Az időpontod módosult. Új időpont: ${newDate} ${newTime}. ${newNote ? 'Megjegyzés: ' + newNote : ''} Üdv: Chrissors`;
                window.location.href = `sms:${slot.clientPhone}?body=${encodeURIComponent(message)}`;
            }
            this.modifyingSlotId = null;
            this.showDashboard();
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
            const bookingCount = this.data.filter(slot => slot.date === dateStr && slot.booked).length;

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
        const listFeher = document.getElementById('day-list-feher');
        const listDebrecen = document.getElementById('day-list-debrecen');

        const bulkContainer = document.getElementById('bulk-message-container');
        this.currentSelectedDateStr = dateStr;

        detailsContainer.classList.remove('hidden');
        label.innerText = `Foglalások: ${dateStr}`;
        listFeher.innerHTML = ''; listDebrecen.innerHTML = '';

        const dayBookings = this.data.filter(slot => slot.date === dateStr && slot.booked)
            .sort((a,b) => a.time.localeCompare(b.time));


        if(dayBookings.length === 0) {
            listFeher.innerHTML = '<p style="color:#666; text-align:center;">Nincs foglalás.</p>';
            listDebrecen.innerHTML = '<p style="color:#666; text-align:center;">Nincs foglalás.</p>';
            if(bulkContainer) bulkContainer.style.display = 'none';
            return;
        }
        
        if(bulkContainer) bulkContainer.style.display = 'block';


        dayBookings.forEach(slot => {
            // --- ÚJ LOGIKA: 31 napos visszatekintés ---
            const slotDate = new Date(slot.date);
            const past31 = new Date(slot.date);
            past31.setDate(slotDate.getDate() - 31);
            
            let recentBookingCount = 0;
            if (slot.clientName) {
                // Megszámoljuk, hány foglalása van a vendégnek az adott időpontot megelőző 31 napban
                recentBookingCount = this.data.filter(s => {
                    if (!s.booked || s.clientName !== slot.clientName) return false;
                    const d = new Date(s.date);
                    return d >= past31 && d <= slotDate;
                }).length;
            }
            
            // Kedvezményes 
            let badgeHtml = '';
            if (recentBookingCount >= 3) {
                badgeHtml = '<span class="discount-badge">Kedvezményes</span>';
            }
            // --- ÚJ LOGIKA VÉGE ---

            const item = document.createElement('div');
            item.className = 'dashboard-item is-booked';
            item.style.display = 'block';
            
            // JAVÍTOTT HTML STRUKTÚRA ÉS A BADGE BEILLESZTÉSE
            item.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <strong style="color:var(--primary); font-size:1.1rem;">${slot.time}</strong>
                        <div class="client-details">
                            ${app.escapeHTML(slot.clientName)} <br>
                            <a href="tel:${slot.clientPhone}" style="color:white;">${app.escapeHTML(slot.clientPhone)}</a>
                        </div>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:flex-end; gap: 4px;">
                        <span style="font-size:0.8rem; color:#aaa;">${app.escapeHTML(slot.clientEmail) || 'Nincs email'}</span> 
                        ${badgeHtml}
                    </div>
                </div>
                <div style="display:flex; flex-direction:column; gap:3px; align-items:flex-end; margin-top: 10px;">
                    <span class="delete-btn" onclick="app.deleteSlot('${slot.id}')">Törlés</span>
                    <span class="modify-btn" onclick="app.openModifyView('${slot.id}')">Módosítás</span>
                    <span class="republish-btn" onclick="app.republishSlot('${slot.id}')">Újrahirdetés</span>
                </div>
                ${slot.clientNote ? `<div class="client-note" style="margin-top: 8px;">"${app.escapeHTML(slot.clientNote)}"</div>` : ''}
            `;
            
            if(slot.location === 'Fehérgyarmat') listFeher.appendChild(item);
            else listDebrecen.appendChild(item);
        });
    },

    sendBulkSMS: function() {
        if (!this.currentSelectedDateStr) return;
        const dateStr = this.currentSelectedDateStr;
        const dayBookings = this.data.filter(slot => slot.date === dateStr && slot.booked);

        // Kigyűjtjük az egyedi telefonszámokat (ne kapjon valaki 2 SMS-t, ha dupla időpontja van)
        const phones = [...new Set(dayBookings.map(s => s.clientPhone).filter(Boolean))];

        if (phones.length === 0) {
            return this.showNotification('Nincs elérhető telefonszám ezen a napon.', 'error');
        }

        // Telefonszámok összefűzése vesszővel (Standard formátum csoportos SMS-hez)
        const phoneString = phones.join(',');

        // Sablonszöveg összeállítása
        const bodyText = `Kedves Vendégem! Szeretettel várlak a holnapi (${dateStr}) lefoglalt időpontodra. Ha közbejött valami, kérlek, jelezd minél hamarabb! Üdv: Krisztián`;
        const encodedBody = encodeURIComponent(bodyText);

        // SMS link megnyitása a telefonon
        window.location.href = `sms:${phoneString}?body=${encodedBody}`;
    },

    renderAdminLists: function() {
        const sorted = this.data.slice().sort((a,b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
        const listFeher = document.getElementById('list-manage-feher');
        const listDebrecen = document.getElementById('list-manage-debrecen');
        if (listFeher) listFeher.innerHTML = '';
        if (listDebrecen) listDebrecen.innerHTML = '';
        let counts = { mf: 0, md: 0 };

        const groups = { 'Fehérgyarmat': {}, 'Debrecen': {} };
        sorted.forEach(slot => {
            const loc = slot.location === 'Fehérgyarmat' ? 'Fehérgyarmat' : 'Debrecen';
            if (!groups[loc][slot.date]) groups[loc][slot.date] = [];
            groups[loc][slot.date].push(slot);
            if (loc === 'Fehérgyarmat') counts.mf++;
            else counts.md++;
        });

        // Átadtam a lokáció nevét (locName) hogy a törlés függvény tudja
        const renderLocationGroups = (container, locationGroups, locName) => {
            if (!container) return;
            const dates = Object.keys(locationGroups).sort();
            if (dates.length === 0) {
                container.innerHTML = '<p style="color:#666; font-style:italic; padding:10px;">Nincs aktív időpont.</p>';
                return;
            }
            dates.forEach(date => {
                const slots = locationGroups[date];
                const dateObj = new Date(date);
                const dayName = dateObj.toLocaleDateString('hu-HU', { weekday: 'long' });
                const formattedDate = date.replace(/-/g, '.').substring(5);
                const bookedCount = slots.filter(s => s.booked).length;

                const dayWrapper = document.createElement('div');
                dayWrapper.className = 'day-group';
                dayWrapper.style.marginBottom = '8px';

                const header = document.createElement('div');
                header.className = 'day-header';
                header.style.cursor = 'pointer';
                // ÚJ NAP TÖRLÉSE GOMB A FEJLÉCBE
                header.innerHTML = `
                    <span>${formattedDate} – ${dayName.charAt(0).toUpperCase() + dayName.slice(1)}</span>
                    <div style="display:flex; align-items:center; gap: 15px;">
                        <span style="font-size:0.8rem; color:#888;">${slots.length} időpont${bookedCount > 0 ? ` · <span style="color:var(--danger)">${bookedCount} foglalt</span>` : ''}</span>
                        <button class="delete-day-btn" onclick="app.deleteDay(event, '${date}', '${locName}')">Nap törlése</button>
                    </div>
                `;

                const slotsDiv = document.createElement('div');
                slotsDiv.style.cssText = 'display:none; flex-direction:column; gap:8px; padding:12px 16px; background:transparent; border-top:1px solid #333;';

                slots.forEach(slot => {
                    const item = document.createElement('div');
                    item.className = 'dashboard-item';
                    item.style.cssText = 'margin:0; border-radius:4px;';
                    if (slot.booked) item.style.borderLeftColor = 'var(--danger)';
                    item.innerHTML = `
                        <div>
                            <span style="color:#fff; font-weight:bold;">${slot.time}</span>
                            ${slot.booked
                                ? `<span style="color:var(--danger); margin-left:8px; font-size:0.8rem;">[FOGLALT – ${app.escapeHTML(slot.clientName || '')}]</span>`
                                : `<span style="color:#777; margin-left:8px; font-size:0.8rem;">[SZABAD${slot.maxDuration && slot.maxDuration < 60 ? ` - Max: ${slot.maxDuration}p` : ''}]</span>`
                            }
                        </div>
                        <div class="delete-btn" onclick="app.deleteSlot('${slot.id}')">Törlés</div>
                    `;
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
            });
        };

        renderLocationGroups(listFeher, groups['Fehérgyarmat'], 'Fehérgyarmat');
        renderLocationGroups(listDebrecen, groups['Debrecen'], 'Debrecen');

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

        const now = new Date();
        const tomorrow = new Date(now.getTime() + (6 * 60 * 60 * 1000));

        const filtered = this.data.filter(item => {
            const isFree = item.location === this.currentLocation && !item.booked;
            const slotDateTime = new Date(`${item.date}T${item.time}:00`);
            const isAfter24h = slotDateTime > tomorrow;
            return isFree && isAfter24h;
        })
        .sort((a,b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

        if (filtered.length === 0) {
            msg.style.display = 'block';
            return;
        }

        msg.style.display = 'none';

        const groups = {};
        filtered.forEach(slot => {
            if (!groups[slot.date]) {
                groups[slot.date] = [];
            }
            groups[slot.date].push(slot);
        });

        Object.keys(groups).forEach(date => {
            const dayWrapper = document.createElement('div');
            dayWrapper.className = 'day-group';

            const dateObj = new Date(date);
            const dayName = dateObj.toLocaleDateString('hu-HU', { weekday: 'long' });
            const formattedDate = date.replace(/-/g, '.').substring(5);

            const header = document.createElement('div');
            header.className = 'day-header';
            header.innerHTML = `
                <span>${formattedDate} - ${dayName.charAt(0).toUpperCase() + dayName.slice(1)}</span>
                <span style="font-size: 0.8rem; color: #888;">${groups[date].length} időpont</span>
            `;

            const slotsDiv = document.createElement('div');
            slotsDiv.className = 'day-slots hidden';

            groups[date].forEach(slot => {
                const btn = document.createElement('div');
                btn.className = 'time-slot';
                btn.style.margin = "0";
                
                // MÓDOSÍTÁS: Abszolút pozicionált, fekete 90% hátteres jelvény a tetején
                let extraBadge = '';
                if (slot.maxDuration && slot.maxDuration < 60) {
                    extraBadge = `<div class="slot-max-badge">Max: ${slot.maxDuration} perc</div>`;
                }

                btn.innerHTML = `${extraBadge}<strong>${slot.time}</strong><br><span style="font-size:0.7rem; color:var(--primary)">FOGLALÁS</span>`;
                btn.onclick = (e) => {
                    e.stopPropagation();
                    app.startBooking(slot.id);
                };
                slotsDiv.appendChild(btn);
            });

            header.onclick = () => {
                const isHidden = slotsDiv.classList.contains('hidden');
                document.querySelectorAll('.day-slots').forEach(d => d.classList.add('hidden'));
                if (isHidden) {
                    slotsDiv.classList.remove('hidden');
                }
            };

            dayWrapper.appendChild(header);
            dayWrapper.appendChild(slotsDiv);
            container.appendChild(dayWrapper);
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

