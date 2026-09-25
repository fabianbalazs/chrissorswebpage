# ✂️ Chrissors — Online Barber Reservation Platform

<img width="1459" height="723" alt="Képernyőfotó 2026-09-25 - 23 25 22" src="https://github.com/user-attachments/assets/4304e944-cc41-4c3a-b6eb-20b8cb0c5427" />

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

---

## ✨ Features

### For customers
- **Multi-location booking** — choose between Fehérgyarmat and Debrecen
- **Real-time availability** — live calendar synced with Firestore, no double-bookings
- **Service selection** — haircut, beard styling, combo packages, and more
- **Account system** — registration with admin approval, login, and booking history
- **Self-service management** — modify or cancel an existing appointment
- **Post-visit reviews** — automatic prompt after a completed appointment
- **Portfolio gallery** — showcase of past work
- **Price list page**
- **GDPR-ready** — cookie consent banner + privacy/legal pages built in

### For the shop (admin dashboard)
- **Interactive calendar** — month view with per-day breakdown, split by location
- **User approval queue** — vet new registrations before they can book
- **Client management** — searchable list of approved customers
- **Service management** — add/edit/remove active services on the fly
- **SMS reminders** — bulk SMS blast to everyone booked on a given day
- **Review moderation** — approve or reject incoming reviews before they go public

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

## 🗺️ Roadmap

- [ ] Email confirmations for bookings
- [ ] Multi-language support (currently Hungarian only)
- [ ] Staff-level scheduling (multiple barbers per location)
- [ ] Payment/deposit integration

---

## 👤 Author

Built and maintained by **Balázs Fábián**.

📸 [Instagram](https://www.instagram.com/itschrissors)


