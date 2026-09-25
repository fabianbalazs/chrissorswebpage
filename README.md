# ✂️ Chrissors — Online Barber Reservation Platform

<p align="center">
  <img src="https://via.placeholder.com/900x400?text=Chrissors+Hero+Banner" alt="Chrissors hero banner" width="100%">
</p>

<p align="center">
  <b>A sleek, full-stack booking platform for a real-world barbershop brand — Fehérgyarmat & Debrecen.</b><br>
  Built with vanilla JS, Firebase, and a whole lot of attention to detail.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-live-brightgreen" alt="status">
  <img src="https://img.shields.io/badge/platform-web-blue" alt="platform">
  <img src="https://img.shields.io/badge/backend-Firebase-orange" alt="firebase">
  <img src="https://img.shields.io/badge/frontend-Vanilla%20JS-yellow" alt="js">
</p>

---

## 💈 What is this?

**Chrissors** is a complete online reservation system built for a two-location barbershop brand. It replaces manual phone/DM bookings with a self-serve, real-time scheduling experience for customers — plus a full admin back office for the shop owner to run day-to-day operations.

No frameworks, no bloat — just fast, clean vanilla JavaScript talking directly to Firebase.

<p align="center">
  <img src="https://via.placeholder.com/300x600?text=Booking+Flow+Screenshot" width="30%">
  <img src="https://via.placeholder.com/300x600?text=Admin+Calendar+Screenshot" width="30%">
  <img src="https://via.placeholder.com/300x600?text=Gallery+Screenshot" width="30%">
</p>

---

## ✨ Features

### For customers
- 📍 **Multi-location booking** — choose between Fehérgyarmat and Debrecen
- 🕒 **Real-time availability** — live calendar synced with Firestore, no double-bookings
- 💇 **Service selection** — haircut, beard styling, combo packages, and more
- 👤 **Account system** — registration with admin approval, login, and booking history
- ✏️ **Self-service management** — modify or cancel an existing appointment
- ⭐ **Post-visit reviews** — automatic prompt after a completed appointment
- 🖼️ **Portfolio gallery** — showcase of past work
- 💰 **Price list page**
- 🍪 **GDPR-ready** — cookie consent banner + privacy/legal pages built in

### For the shop (admin dashboard)
- 📅 **Interactive calendar** — month view with per-day breakdown, split by location
- ✅ **User approval queue** — vet new registrations before they can book
- 🧑‍🤝‍🧑 **Client management** — searchable list of approved customers
- 🛠️ **Service management** — add/edit/remove active services on the fly
- 💬 **SMS reminders** — bulk SMS blast to everyone booked on a given day
- 🌟 **Review moderation** — approve or reject incoming reviews before they go public

---

## 🧰 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | HTML5, CSS3 (custom, no framework), Vanilla JavaScript |
| Backend / Data | [Firebase](https://firebase.google.com/) (Firestore + Auth) |
| Fonts | Plus Jakarta Sans, Inter (Google Fonts) |
| Hosting | *(add your host here — e.g. Firebase Hosting / Netlify)* |

---

## 📁 Project Structure

```
chrissors/
├── index.html          # Main app — booking flow, gallery, FAQ, admin dashboard
├── arak.html            # Price list page
├── css/
│   └── style.css        # All styling
├── js/
│   └── script.js        # App logic (booking, auth, admin, calendar, reviews)
├── kepek/                # Images & logo assets
├── impresszum.html       # Legal notice
├── adatkezeles.html      # Privacy policy
└── aszf.html             # Terms & conditions
```

---

## 🚀 Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/<your-username>/chrissors.git
   cd chrissors
   ```

2. **Set up Firebase**
   - Create a Firebase project
   - Enable **Firestore** and **Authentication**
   - Drop your Firebase config into `js/script.js`

3. **Run it**
   - Just open `index.html` in a browser, or serve it with any static server:
   ```bash
   npx serve .
   ```

> ⚠️ No build step required — it's fully static + Firebase, ready to deploy anywhere (Firebase Hosting, Netlify, Vercel, GitHub Pages, etc.)

---

## 📸 Screenshots

<p align="center">
  <img src="https://via.placeholder.com/800x450?text=Homepage" width="45%">
  <img src="https://via.placeholder.com/800x450?text=Admin+Dashboard" width="45%">
</p>

*(Replace these placeholders with real screenshots/GIFs of the live site!)*

---

## 🗺️ Roadmap

- [ ] Email confirmations for bookings
- [ ] Multi-language support (currently Hungarian only)
- [ ] Staff-level scheduling (multiple barbers per location)
- [ ] Payment/deposit integration

---

## 👤 Author

Built and maintained by **[your name here]**.

📸 [Instagram](https://www.instagram.com/itschrissors)

---

## 📄 License

*(Add a license — MIT, private, etc.)*
