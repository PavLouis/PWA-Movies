# 🎬 PWA-movies

A full-stack **Progressive Web App (PWA)** for movie management, featuring user authentication, custom movie recommendation lists, commenting, liking, and offline access.

---

## 🚀 Features

### 👨‍💻 User
- Sign up / login with JWT authentication
- Create & manage personal movie recommendation lists
- Like and comment on movies

### 🎥 Admin
- Create, edit, and delete movies
- Manage movie database

### 📱 PWA
- Offline access through Service Workers
- Installable web app with manifest support
- Push notifications via Web Push API

### 📊 Others
- Responsive UI for desktop & mobile
- Fully tested with Jest & Supertest
- Swagger API documentation

---

## 🛠️ Tech Stack

### 🔧 Backend
- **Node.js** / **Express.js**
- **MongoDB**
- **JWT** for auth
- **Swagger** for API docs
- **Jest** & **Supertest** for testing
- **Docker** for isolated testing environment

### 💻 Frontend
- **React 18** + **Vite**
- **Custom Components**: Auth, Admin Panel, Modals, Toasts
- **Service Worker** for offline mode
- **Cypress** for browser testing

---

## 🧪 Testing

```bash
cd backend/tests
docker build -t movie-tests .
docker run movie-tests
