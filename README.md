# Event Countdown Timer (ChronoCount)

A modern full-stack web application built with **Django REST Framework (JWT Authentication)** and **React + Tailwind CSS (Vite)** to track and monitor important events with live real-time countdown timers.

---

## Features

- **User Authentication**: Secure user registration and login with JWT (access + refresh tokens) and protected routes.
- **Data Isolation**: Strict multi-tenant security ensuring users can only view, edit, or delete their own countdowns.
- **Live Real-Time Countdown**: Calculates days, hours, minutes, and seconds locally every second without polling the server.
- **Expired/Celebration State**: Clear visual indicators and celebration animations when an event starts (`🎉 Event Started!`).
- **Interactive Dashboard**:
  - Event filtering by status (*Active*, *All*, *Started*) and category (*Birthday*, *Vacation*, *Exam*, *Work*, *Celebration*, *Personal*).
  - Search bar to instantly filter events by title or notes.
  - Sorting by nearest target date, furthest target date, or recently created.
  - Quick stat summary ribbon displaying total, active, and completed milestones.
- **CRUD Operations**: Modal-based creation and editing with datetime-local picker, and confirmation modal for safe deletions.
- **Responsive & Modern UI**: Tailored dark glassmorphism design with Plus Jakarta Sans and JetBrains Mono typography.

---

## Tech Stack

- **Backend**: Python 3.12, Django 6+, Django REST Framework, SimpleJWT, `django-cors-headers`, SQLite.
- **Frontend**: React 19, Vite, Tailwind CSS, React Router 7, Axios with refresh interceptors, Lucide Icons, Canvas Confetti.

---

## Getting Started

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Run unit tests
python manage.py test

# Start Django development server (runs on http://127.0.0.1:8000)
python manage.py runserver
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev

# Or build for production
npm run build
```

---

## API Endpoints

### Authentication
- `POST /api/register/` — Register new user
- `POST /api/login/` — Authenticate and receive JWT access/refresh tokens
- `POST /api/token/refresh/` — Refresh expired access token
- `GET /api/me/` — Retrieve authenticated user profile

### Events
- `GET /api/events/` — List owner's events (sorted chronologically)
- `POST /api/events/` — Create new countdown event
- `GET /api/events/<id>/` — Retrieve single event
- `PUT /api/events/<id>/` — Update event
- `DELETE /api/events/<id>/` — Delete event
