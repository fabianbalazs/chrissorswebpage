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
    users: [],
    reviews: [],

    currentAdmin: null,
    activeUser: null,
    currentLocation: 'Fehérgyarmat',
    bookingSlotId: null,
    currentCalendarDate: new Date(),
    modifyingSlotId: null,

    reviewingSlotId: null,
    currentRating: 0,
    editingReviewId: null,

    init: function() {

        db.collection("appointments").onSnapshot((querySnapshot) => {
            this.data = [];
            querySnapshot.forEach((doc) => {
                this.data.push({ id: doc.id, ...doc.data() });
            });
            this.renderPublicSlots();
            if(this.activeUser) { this.renderUserBookings(); this.renderHeroBookings(); }
            if(this.currentAdmin) {
                this.renderAdminLists();
                this.renderAdminCalendar();
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

        
        // ÚJ Auth figyelő - Firebase Auth alapú ellenőrzés
        firebase.auth().onAuthStateChanged((user) => {
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
                    const isAtAdminUrl = window.location.hash === '#admin' || window.location.search.includes('admin');
                    if (isAtAdminUrl) this.showDashboard();
                } else {
                    // Sima felhasználó betöltése Firestore-ból Auth UID alapján
                    db.collection("users").doc(user.uid).get().then((doc) => {
                        if (doc.exists) {
                            const userData = { id: doc.id, ...doc.data() };
                            if (userData.status === 'approved') {
                                this.activeUser = userData;
                                this.renderUserBookings();
                                this.renderHeroBookings();
                                
                                // ÚJ RÉSZ: Frissítjük a UI-t, hogy eltűnjenek a login gombok
                                if (!document.getElementById('view-home').classList.contains('hidden')) {
                                    this.showHome();
                                }
                            }
                        }
                    });
                }
            } else {
                // Senki sincs bejelentkezve
                this.currentAdmin = null;
                this.activeUser = null;
                
                // ÚJ RÉSZ: Biztosítjuk, hogy a kártyák eltűnjenek és a gombok visszajöjjenek kilépéskor
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

        if (!this.activeUser) {
            userInfo.innerHTML = '<p style="color:#888;">Nincs bejelentkezett felhasználó.</p>';
            list.innerHTML = '<p style="color:#666; font-size:0.9rem;">Jelentkezz be a foglalásaid megtekintéséhez.</p>';
            logoutBtn.classList.add('hidden');
            return;
        }

        logoutBtn.classList.remove('hidden');
        userInfo.innerHTML = `Üdv, <strong style="color:var(--primary); font-size:1.0rem;">${this.activeUser.name}</strong>`;
        list.innerHTML = '';

        const myBookings = this.data.filter(slot =>
            slot.booked &&
            slot.clientName === this.activeUser.name &&
            slot.clientInsta === this.activeUser.insta
        ).sort((a,b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

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

        const myBookings = this.data.filter(slot =>
            slot.booked &&
            slot.clientName === this.activeUser.name &&
            slot.clientInsta === this.activeUser.insta
        ).sort((a,b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

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

    // ÚJ: Firebase Auth kijelentkezés
    logoutUser: function() {
        firebase.auth().signOut().then(() => {
            this.activeUser = null;
            this.renderHeroBookings();
            this.showNotification('Sikeres kijelentkezés!');
            this.showHome();
        }).catch((error) => {
            console.error("Kijelentkezési hiba:", error);
            this.showNotification('Hiba a kijelentkezéskor.', 'error');
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
            home.appendChild(booking);
        }
    },
    showRegister: function() { this.hideAllViews(); document.getElementById('view-register').classList.remove('hidden'); },
    showUserLogin: function() { this.hideAllViews(); document.getElementById('view-user-login').classList.remove('hidden'); },
    showForgotPassword: function() { this.hideAllViews(); document.getElementById('view-forgot-password').classList.remove('hidden'); },
    showLogin: function() { this.hideAllViews(); document.getElementById('view-login').classList.remove('hidden'); },
    showDashboard: function() {
        this.hideAllViews();
        document.getElementById('view-dashboard').classList.remove('hidden');
        this.renderAdminLists();
        this.renderAdminCalendar();
        this.renderAdminReviews();
    },
    hideAllViews: function() { document.querySelectorAll('body > div[id^="view-"]').forEach(el => el.classList.add('hidden')); },
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

    // ÚJ: Regisztráció Firebase Auth-al
    submitRegistration: function() {
        if(!document.getElementById('reg-gdpr').checked) {
            return this.showNotification('A regisztrációhoz el kell fogadnod a feltételeket!', 'error');
        }

        const name = document.getElementById('reg-name').value;
        const phone = document.getElementById('reg-phone').value;
        const insta = document.getElementById('reg-insta').value;
        const email = document.getElementById('reg-email').value; // Új mező
        const pass = document.getElementById('reg-pass').value;

        if(!name || !phone || !insta || !email || !pass) return this.showNotification('Minden mezőt tölts ki!', 'error');

        const exists = this.users.find(u => u.insta.toLowerCase() === insta.toLowerCase() || u.name.toLowerCase() === name.toLowerCase());
        if(exists) return this.showNotification('Ezzel a névvel vagy Instagram fiókkal már regisztráltak.', 'error');

        // 1. Felhasználó létrehozása Auth-ban
        firebase.auth().createUserWithEmailAndPassword(email, pass)
        .then((userCredential) => {
            const user = userCredential.user;
            // 2. Adatok mentése Firestore-ba jelszó nélkül
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
            // Még pending, ezért azonnal kiléptetjük
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

    // ÚJ: Belépés Firebase Auth-al
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
                    this.showNotification(`Sikeres belépés! Üdv, ${userData.name}`, 'success');
                    document.getElementById('login-email').value = '';
                    document.getElementById('login-pass').value = '';
                    this.showHome();
                    this.renderUserBookings();
                    this.renderHeroBookings();
                    this.checkPendingReviews();
                }
            } else {
                firebase.auth().signOut();
                this.showNotification('Nincs ilyen profil.', 'error');
            }
        })
        .catch((error) => {
            console.error("Login hiba:", error);
            this.showNotification('Hibás e-mail cím vagy jelszó.', 'error');
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

    startBooking: function(id) {
        const slot = this.data.find(x => x.id === id);
        if(slot) {
            this.bookingSlotId = id;
            document.getElementById('booking-details-display').innerText = `${slot.location} - ${slot.date} ${slot.time}`;
            document.getElementById('client-phone').value = this.activeUser.phone || '';
            document.getElementById('client-email').value = this.activeUser.email || '';
            document.getElementById('client-note').value = '';
            this.hideAllViews();
            document.getElementById('view-booking-form').classList.remove('hidden');
        }
    },

    submitBooking: function() {
        const phone = document.getElementById('client-phone').value;
        const email = document.getElementById('client-email').value.trim();
        const note = document.getElementById('client-note').value;

        const cleanPhone = phone.replace(/\s+/g, '').replace(/-/g, '');
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!isEmailValid) return this.showNotification('Kérlek adj meg egy érvényes e-mail címet!', 'error');
        if (!note || note.length < 3) {
            return this.showNotification('Kérlek írj egy rövid megjegyzést!', 'error');
        }

        if(this.bookingSlotId) {
            db.collection("appointments").doc(this.bookingSlotId).update({
                booked: true,
                clientName: this.activeUser.name,
                clientInsta: this.activeUser.insta,
                clientPhone: cleanPhone,
                clientEmail: email,
                clientNote: note
            })
            .then(() => {
                this.showNotification('Sikeres foglalás!', 'success');
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
                <div class="review-text">${review.text}</div>
                <div class="review-author">${review.userName}</div>
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
        });
    },

    switchAdminTab: function(tab) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(`tab-${tab}`).classList.add('active');
        document.querySelectorAll('div[id^="admin-section-"]').forEach(div => div.classList.add('hidden'));
        document.getElementById(`admin-section-${tab}`).classList.remove('hidden');
        if(tab === 'bookings') this.renderAdminCalendar();
        else if (tab === 'reviews') this.renderAdminReviews();
        else this.renderAdminLists();
    },

    addSlot: function() {
    const loc = document.getElementById('new-loc').value;
    const date = document.getElementById('new-date').value;
    const time = document.getElementById('new-time').value;
    const adminPass = document.getElementById('admin-pass').value;

    db.collection("appointments").add({
        location: loc,
        date: date,
        time: time,
        booked: false,
        adminKey: adminPass,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => this.showNotification('Időpont létrehozva.', 'success'));
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

    republishSlot: function(id) {
    if(confirm('Biztosan felszabadítod ezt az időpontot? A vendég adatai törlődnek, és az időpont újra foglalható lesz.')) {
        db.collection("appointments").doc(id).update({
            booked: false,
            clientName: firebase.firestore.FieldValue.delete(),
            clientInsta: firebase.firestore.FieldValue.delete(),
            clientPhone: firebase.firestore.FieldValue.delete(),
            clientEmail: firebase.firestore.FieldValue.delete(),
            clientNote: firebase.firestore.FieldValue.delete()
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
                    <strong style="color:white;">${r.userName}</strong> (${r.rating} ★)<br>
                    <span style="color:#ccc; font-style:italic;">"${r.text}"</span>
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
                    <strong style="color:white;">${r.userName}</strong> (${r.rating} ★)<br>
                    <span style="color:#ccc; font-style:italic;">"${r.text}"</span>
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

            // ÚJ RÉSZ: Mai nap azonosítása
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
        detailsContainer.classList.remove('hidden');
        label.innerText = `Foglalások: ${dateStr}`;
        listFeher.innerHTML = ''; listDebrecen.innerHTML = '';
        const dayBookings = this.data.filter(slot => slot.date === dateStr && slot.booked)
            .sort((a,b) => a.time.localeCompare(b.time));
        if(dayBookings.length === 0) {
            listFeher.innerHTML = '<p style="color:#666; text-align:center;">Nincs foglalás.</p>';
            listDebrecen.innerHTML = '<p style="color:#666; text-align:center;">Nincs foglalás.</p>';
            return;
        }
        dayBookings.forEach(slot => {
            const item = document.createElement('div');
            item.className = 'dashboard-item is-booked';
            item.style.display = 'block';
            item.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div><strong style="color:var(--primary); font-size:1.1rem;">${slot.time}</strong>
                    <div class="client-details">${slot.clientName} <br><a href="tel:${slot.clientPhone}" style="color:white;">${slot.clientPhone}</a></div></div>
                    <span style="font-size:0.8rem; color:#aaa;">${slot.clientEmail || 'Nincs email'}</span> </div></div>
                    <div style="display:flex; flex-direction:column; gap:3px; align-items:flex-end;">
                        <span class="delete-btn" onclick="app.deleteSlot('${slot.id}')">Törlés</span>
                        <span class="modify-btn" onclick="app.openModifyView('${slot.id}')">Módosítás</span>
                        <span class="republish-btn" onclick="app.republishSlot('${slot.id}')">Újrahirdetés</span>
                    </div>
                </div>
                ${slot.clientNote ? `<div class="client-note">"${slot.clientNote}"</div>` : ''}
            `;
            if(slot.location === 'Fehérgyarmat') listFeher.appendChild(item);
            else listDebrecen.appendChild(item);
        });
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

        const renderLocationGroups = (container, locationGroups) => {
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
                header.innerHTML = `
                    <span>${formattedDate} – ${dayName.charAt(0).toUpperCase() + dayName.slice(1)}</span>
                    <span style="font-size:0.8rem; color:#888;">${slots.length} időpont${bookedCount > 0 ? ` · <span style="color:var(--danger)">${bookedCount} foglalt</span>` : ''}</span>
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
                                ? `<span style="color:var(--danger); margin-left:8px; font-size:0.8rem;">[FOGLALT – ${slot.clientName || ''}]</span>`
                                : '<span style="color:#777; margin-left:8px; font-size:0.8rem;">[SZABAD]</span>'
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

        renderLocationGroups(listFeher, groups['Fehérgyarmat']);
        renderLocationGroups(listDebrecen, groups['Debrecen']);

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
                div.innerHTML = `<div><strong style="color:white;">${u.name}</strong> <br><span style="color:var(--primary);">${u.insta}</span></div><div style="display:flex; gap:10px;"><button class="btn" style="padding:5px 10px; font-size:0.8rem;" onclick="app.approveUser('${u.id}')">Elfogadás</button><span class="delete-btn" onclick="app.deleteUser('${u.id}')">X</span></div>`;
                pendingList.appendChild(div);
            });
        }

        const approvedList = document.getElementById('list-approved-users');
        if(approvedList) {
            approvedList.innerHTML = '';
            const approvedUsers = this.users.filter(u => u.status === 'approved');
            if(document.getElementById('count-approved-users')) document.getElementById('count-approved-users').innerText = approvedUsers.length;
            approvedUsers.forEach(u => {
                const div = document.createElement('div');
                div.className = 'dashboard-item';
                div.style.borderLeftColor = 'var(--success)';
                div.innerHTML = `<div><strong style="color:white;">${u.name}</strong> <br><span style="color:#777;">${u.insta}</span></div><span class="delete-btn" onclick="app.deleteUser('${u.id}')">Törlés</span>`;
                approvedList.appendChild(div);
            });
        }
    },

    renderPublicSlots: function() {
        const container = document.getElementById('slots-container');
        const msg = document.getElementById('no-slots-msg');
        container.innerHTML = '';

        const now = new Date();
        const tomorrow = new Date(now.getTime() + (24 * 60 * 60 * 1000));

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
                btn.innerHTML = `<strong>${slot.time}</strong><br><span style="font-size:0.7rem; color:var(--primary)">FOGLALÁS</span>`;
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
