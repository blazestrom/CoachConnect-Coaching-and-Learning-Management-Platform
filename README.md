# CoachConnect: Coaching and Learning Management Platform

CoachConnect is an enterprise-grade full-stack coaching and learning management platform designed to centralize and automate the coordination of coaching sessions, learning programs, curricula, and student progress. It connects students, coaches, and platform administrators through role-based workflows and a secure REST API.

---

## 🚀 Key Highlights & Architectural Strengths

- **Role-Based Access Control (RBAC)**: Distinct workflows and permissions for **Students**, **Coaches**, and **Administrators**.
- **Conflict-Free Session Scheduling**: Coaches define date and time availability slots. Concurrency control and database transaction locking (`select_for_update`) prevent race condition double-bookings and overlapping reservations.
- **Dynamic Curriculum & Progress Engine**: Real-time progress percentage tracking as learners complete video lessons, reading documents, and capstone assignments.
- **In-App Real-Time Alerts**: Contextual notifications for booking confirmations, session cancellations, schedule updates, and milestone completions.
- **Role-Tailored Dashboards**:
  - **Student**: Enrolled courses with visual completion bars, upcoming 1-on-1 sessions, quick-join video call links.
  - **Coach**: Course management, student roster, slot scheduling calendar, session completion controls.
  - **Administrator**: Platform statistics, user governance (activation/deactivation, role promotion), course moderation.
- **Interactive OpenAPI 3.0 / Swagger UI**: Built-in interactive API exploration at `/api/docs/`.
- **Pre-Seeded Multi-Persona Demo**: One-click instant persona switching between Administrator, Coaches, and Students directly from the UI navbar.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router 7, Lucide Icons, Modern Responsive Design System |
| **Backend** | Python 3.10+, Django 5.2, Django REST Framework (DRF), django-cors-headers, drf-spectacular |
| **Database** | PostgreSQL (Production) / SQLite (Development Fallback with atomic transaction constraints) |
| **Authentication** | Token-based Authentication (`rest_framework.authtoken`) with role-based permission classes |
| **API Documentation**| OpenAPI 3.0 via `drf-spectacular` + Swagger UI (`/api/docs/`) & Redoc (`/api/redoc/`) |

---

## 🗄️ Database Schema & Entities

```
+--------------------+           +----------------------+
|       User         | 1       1 |     CoachProfile     |
|--------------------|<--------->|----------------------|
| id (PK)            |           | headline, expertise  |
| email (Unique)     |           | hourly_rate, rating  |
| role, avatar, bio  |           | total_reviews        |
+--------------------+           +----------------------+
        | 1
        | 1                      +----------------------+
        +----------------------->|    StudentProfile    |
        |                        |----------------------|
        |                        | education_level      |
        |                        | learning_goals       |
        |                        +----------------------+
        | 1
        |
        | N                      +----------------------+
        +----------------------->|   AvailabilitySlot   |
        | (as coach)             |----------------------|
        |                        | coach_id, date       |
        |                        | start_time, end_time |
        |                        | is_booked (Boolean)  |
        |                        +----------------------+
        |                                   | 1
        | 1                                 | 1 (Unique)
        |                                   v
        | N                      +----------------------+
        +----------------------->|       Booking        |
        | (as coach / student)   |----------------------|
        |                        | student_id, coach_id |
        |                        | slot_id, topic, notes|
        |                        | meeting_link, status |
        |                        +----------------------+
        | 1
        |
        | N                      +----------------------+
        +----------------------->|        Course        |
        | (as coach)             |----------------------|
        |                        | title, slug, price   |
        |                        | category, level      |
        |                        | learning_objectives  |
        |                        +----------------------+
        |                                   | 1
        |                                   | N
        |                                   v
        |                        +----------------------+
        |                        |   LearningResource   |
        |                        |----------------------|
        |                        | course_id, title     |
        |                        | resource_type, url   |
        |                        | order, duration_mins |
        |                        +----------------------+
        | 1                                 | 1
        |                                   |
        | N                      +----------v-----------+
        +----------------------->|   ResourceProgress   |
        | (as student)           |----------------------|
        v                        | is_completed (Bool)  |
+--------------------+           | completed_at         |
|     Enrollment     | 1       N +----------------------+
|--------------------|<----------+
| student_id         |
| course_id          |
| status, progress_% |
+--------------------+
```

---

## 🔑 Demo Accounts

The database comes pre-seeded with realistic courses, lessons, availability slots, and sample bookings. Use the **"Demo Roles"** dropdown in the top-right navbar to test any persona with 1-click, or log in with credentials:

| Persona | Email | Password | Role | Specialization |
|---|---|---|---|---|
| **Administrator** | `admin@coachconnect.io` | `AdminPass123!` | Administrator | Platform Governance |
| **Coach Sarah** | `sarah.coach@coachconnect.io` | `CoachPass123!` | Coach | Principal Cloud Architect |
| **Coach David** | `david.coach@coachconnect.io` | `CoachPass123!` | Coach | Senior AI & LLM Specialist |
| **Coach Elena** | `elena.coach@coachconnect.io` | `CoachPass123!` | Coach | Staff Full-Stack Engineer |
| **Student Alex** | `alex.student@coachconnect.io` | `StudentPass123!` | Student | Mid-Level Developer |
| **Student Priya** | `priya.student@coachconnect.io` | `StudentPass123!` | Student | CS Graduate / AI Aspirant |

---

## 🏃 Quick Start Guide

### 1. Backend Setup (Django & DRF)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run migrations (initializes SQLite or PostgreSQL schema)
python manage.py migrate

# Seed database with realistic demo courses, slots, and bookings
python seed_demo.py

# (Optional) Run automated test suite
python manage.py test

# Start the Django development server
python manage.py runserver 8000
```

Backend will be accessible at:
- **API Root**: `http://localhost:8000/api/`
- **Interactive Swagger Documentation**: `http://localhost:8000/api/docs/`
- **Redoc Documentation**: `http://localhost:8000/api/redoc/`
- **Django Admin Portal**: `http://localhost:8000/admin/`

### 2. Frontend Setup (React & Vite)

```bash
# In a separate terminal, navigate to the frontend directory
cd frontend

# Install npm packages
npm install

# Start Vite development server
npm run dev
```

Frontend application will open at:
- **Application UI**: `http://localhost:5173/`

---

## 🔌 API Reference & Endpoints

### Authentication & Profiles
- `POST /api/auth/register/` - Create Student or Coach account
- `POST /api/auth/login/` - Authenticate and obtain auth token
- `POST /api/auth/logout/` - Invalidate session token
- `GET /api/auth/me/` - Retrieve current user & profile
- `PATCH /api/auth/me/` - Update profile bio, phone, rate, goals

### Coaches Directory
- `GET /api/coaches/` - List verified coaches (search by name, expertise)
- `GET /api/coaches/<id>/` - Retrieve coach profile details

### Courses & Curricula
- `GET /api/courses/` - Search, filter (category, level), and list courses
- `POST /api/courses/` - Create course (Coach & Admin only)
- `GET /api/courses/<id>/` - Course syllabus, objectives, enrollment status
- `POST /api/courses/<id>/enroll/` - Student enrollment
- `POST /api/courses/<id>/resources/` - Add lesson modules (Coach owner)
- `POST /api/courses/resources/<id>/toggle-complete/` - Check off lesson & recalculate progress

### Availability & Session Bookings
- `GET /api/slots/` - List availability slots (filter by coach, date, available)
- `POST /api/slots/` - Create reservable slot (Coach only)
- `DELETE /api/slots/<id>/` - Remove unbooked slot (Coach only)
- `GET /api/bookings/` - List student or coach bookings (filter by status)
- `POST /api/bookings/` - Book session (atomic locking prevents conflicts)
- `POST /api/bookings/<id>/cancel/` - Cancel booking and free up slot

### In-App Notifications
- `GET /api/notifications/` - List notifications
- `GET /api/notifications/unread-count/` - Get badge count
- `PATCH /api/notifications/<id>/read/` - Mark single notification as read
- `POST /api/notifications/mark-all-read/` - Mark all as read

### Platform Administration & Analytics
- `GET /api/dashboard/stats/` - Aggregated role metrics (Student, Coach, Admin)
- `GET /api/admin/users/` - User directory with role & status controls
- `PATCH /api/admin/users/<id>/status/` - Activate, deactivate, or change role
