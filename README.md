# MyAbsensi — WFH Attendance System

A fullstack web application for managing employee WFH attendance. Built with **NestJS** (backend) and **Next.js 16** (frontend).

---

## Tech Stack

| Layer       | Technology                            |
| ----------- | ------------------------------------- |
| Backend     | NestJS 11, TypeORM, MySQL             |
| Frontend    | Next.js 16, React 19, Tailwind CSS v4 |
| Auth        | JWT (Passport.js)                     |
| File upload | Multer                                |

---

## 1. Clone the Repository

```bash
git clone <repository-url>
cd nest-js-absensi-project
```

---

## 2. Database Setup

### Create the local MySQL database

```sql
CREATE DATABASE nestjs_absensi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 3. Backend Setup

```bash
cd backend
npm install
```

### 3a. (Optional) Modify the provided .env file

An `.env` file is already provided inside the `backend` folder. Modify them as you wish.

### 3b. Run database migrations

This creates the `employees` and `attendances` tables:

```bash
npm run migration:run
```

### 3c. Seed the database

This populates sample employees and 14 days of attendance history:

```bash
npm run seed
```

### 3d. Start the backend server

```bash
npm run start:dev
```

The backend will be running at **http://localhost:3001**

---

## 4. Frontend Setup

Open a **new terminal** (keep the backend running):

```bash
cd frontend
npm install
```

### 4a. (Optional) Modify the provided .env file

### 4b. Start the frontend server

```bash
npm run dev
```

The frontend will be running at **http://localhost:3000**

---

## 5. Demo the Application

Open **http://localhost:3000** in your browser.

### Login credentials

| Role              | Email               | Password      | Notes                          |
| ----------------- | ------------------- | ------------- | ------------------------------ |
| Admin (HRD)       | `admin@company.com` | `admin123`    |
| Employee          | `budi@company.com`  | `password123` |
| Employee          | `sam@company.com`   | `password123` |
| Employee          | `john@company.com`  | `password123` | -> Shouldn't be able to log in |
| Employee          | `ahmad@company.com` | `password123` |
| Employee          | `dewi@company.com`  | `password123` |
| Employee          | `rina@company.com`  | `password123` |
| Inactive employee | `ray@company.com`   | `password123` |

---

## 6. Feature Walkthrough

### Employee portal (login as `budi@company.com`)

- **Dashboard** — see this week's attendance strip, monthly stats, recent activity
- **Check in** — open camera, capture photo, submit check-in with optional notes
- **History** — view full attendance history by month with sort and pagination

### Admin / HRD portal (login as `admin@company.com`)

- **Employee master data** — full CRUD for employees, search, filter by department, sort all columns, activate/deactivate employees
- **Attendance log** — view daily attendance for all employees including absent detection, filter by department or status, view proof photos
- **Per-employee attendance** — click "Attendance" on any employee row to see their full attendance history with monthly summary

---

## 7. Project Structure

```
nest-js-absensi-project/
├── backend/                  # Nest.js app
│   ├── logs/
│   ├── src/
│   │   ├── auth/             # JWT auth
│   │   ├── employees/        # Employee CRUD
│   │   ├── attendance/       # Attendance + photo upload
│   │   └── database/
│   │       ├── migrations/   # TypeORM migrations
│   │       └── seeds/        # Seed data
│   ├── uploads/              # Uploaded proof photos (auto-created)
│   └── .env
│
└── frontend/                 # Next.js 16 app
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/       # Login page
    │   │   ├── (employee)/   # Employee portal (Dashboard, Check In, Attendance History)
    │   │   └── (admin)/      # Admin / HRD portal (Employees Master Data, Daily Attendance, Specific Employee Attendance History)
    │   ├── components/
    │   └── lib/
    └── .env
```
