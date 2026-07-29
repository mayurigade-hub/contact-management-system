<div align="center">

# Contact Management System

### Full-Stack Contact Manager with Firebase & Real-Time Features

*A polished full-stack contact management application built with HTML, CSS, JavaScript, Node.js, Express, and Firebase Firestore — featuring favorites, category filtering, live photo upload, toast notifications, custom modals, and a fully responsive layout.*

[![HTML5](https://img.shields.io/badge/HTML5-Markup-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-Responsive%20UI-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-REST%20API-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)

[Getting Started](#getting-started) · [Project Structure](#project-structure) · [Features](#features) · [Environment Setup](#environment-setup) · [Live Website](#live-website)

</div>

---

## What is Contact Management System?

Contact Management System is a full-stack web application for organizing and managing your personal and professional contacts in one place.

It features a clean, modern UI built with vanilla HTML, CSS, and JavaScript on the frontend, powered by a Node.js + Express REST API on the backend with Firebase Firestore as the cloud database. Every contact is stored persistently and accessible from any device.

The app supports full CRUD operations, favorites starring, category tagging, real-time search, horizontal section filter tabs, direct photo uploads from your device, live image previews, custom toast notifications, and a polished responsive layout for all screen sizes.

---

<a name="features"></a>

## Features

- **Full CRUD** — Add, edit, delete, and view contacts with validation
- **Favorites** — Mark contacts as favorites with a star badge on the card
- **Categories** — Tag contacts as Work, Family, Friends, or Other
- **Section Filter Tabs** — Filter by All, Favorites, Work, Family, Friends, Other
- **Real-Time Search** — Instant filtering by name, email, or phone
- **Photo Upload** — Upload a photo from your device or paste an image URL
- **Live Preview** — See a circular thumbnail preview before saving
- **Toast Notifications** — Sleek auto-dismissing success/error toasts (no browser alerts)
- **Custom Delete Modal** — Confirmation dialog instead of browser confirm()
- **Fully Responsive** — Works on desktop, tablet, and mobile with swipeable tabs
- **Firebase Firestore** — Cloud-persisted data accessible from any device

---

<a name="project-structure"></a>

## Project Structure

```
contact-management-system/
├── backend/
│   ├── config/
│   │   └── firebase.js          # Firebase Admin SDK initialization
│   ├── server.js                # Express REST API (CRUD routes)
│   ├── package.json
│   └── .env                     # Environment variables (not committed)
├── frontend/
│   ├── index.html               # Main page markup and modals
│   ├── style.css                # Full responsive styling
│   └── app.js                   # All frontend logic (CRUD, filters, upload, toasts)
├── .gitignore
└── README.md
```

---

<a name="getting-started"></a>

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A [Firebase](https://firebase.google.com/) project with Firestore enabled
- Your Firebase serviceAccountKey.json (downloaded from Firebase Console)

### Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/mayurigade-hub/contact-management-system.git

# 2. Navigate to the backend
cd contact-management-system/backend

# 3. Install dependencies
npm install

# 4. Set up your Firebase credentials (see Environment Setup below)

# 5. Start the server
npm start
```

Then open your browser at:

```
http://localhost:5000
```

---

<a name="environment-setup"></a>

## Environment Setup

### Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/) → Your Project → Project Settings → Service Accounts
2. Click **Generate new private key** → Download `serviceAccountKey.json`
3. Place it at: `backend/config/serviceAccountKey.json`

> ⚠️ **This file is listed in `.gitignore` and must NEVER be committed to GitHub.**

### `.env` File

Create a `backend/.env` file:

```env
PORT=5000
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/contacts` | Fetch all contacts |
| `POST` | `/api/contacts` | Create a new contact |
| `PUT` | `/api/contacts/:id` | Update an existing contact |
| `DELETE` | `/api/contacts/:id` | Delete a contact |

---

## Customization

| File | What to Edit |
|---|---|
| `frontend/index.html` | Page structure, modal fields, filter tab labels |
| `frontend/style.css` | Colors, spacing, responsive breakpoints, card layout |
| `frontend/app.js` | Contact logic, category filters, photo upload, toast messages |
| `backend/server.js` | API routes, Firestore collection name, validation rules |

---

<a name = "live-website"></a> 

Live website- 


---

<div align="center">

*Built with HTML, CSS, JavaScript, Node.js, Express, and Firebase.*

**Contact Management System — Add contacts. Organize by category. Star your favorites.**

</div>
