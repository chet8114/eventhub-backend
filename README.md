# EventHub — Event Management System

A complete full-stack Event Management System with role-based authentication, QR-based event entry validation, and admin analytics dashboard.

## 🛠️ Tech Stack

| Layer        | Technology                        |
| ------------ | --------------------------------- |
| Frontend     | React.js (Vite), React Router     |
| Backend      | Node.js, Express.js               |
| Database     | MySQL + Sequelize ORM             |
| Auth         | JWT + bcrypt                      |
| QR System    | qrcode (gen) + html5-qrcode (scan)|
| Email        | Nodemailer (optional SMTP)        |

## 📁 Project Structure

```
app/
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # Route handlers
│   ├── middleware/      # Auth & role middleware
│   ├── models/         # Sequelize models
│   ├── routes/         # API route definitions
│   ├── seeders/        # Database seeding
│   ├── utils/          # QR, email, CSV utilities
│   ├── server.js       # Entry point
│   └── .env            # Environment variables
├── frontend/
│   ├── src/
│   │   ├── api/        # Axios instance
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Auth context
│   │   └── pages/      # Page components
│   │       ├── user/   # User-facing pages
│   │       ├── admin/  # Admin dashboard pages
│   │       └── staff/  # Staff scanner pages
│   ├── index.html
│   └── vite.config.js
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** 18+
- **MySQL** 8.0+ (via MySQL Workbench or CLI)
- **npm** 9+

### 1. Clone / Navigate to project

```bash
cd e:/project/app
```

### 2. Create the MySQL Database

```sql
CREATE DATABASE IF NOT EXISTS event_management_db;
```

### 3. Configure Environment Variables

Edit `backend/.env` with your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=YourPassword
DB_NAME=event_management_db
JWT_SECRET=your_secret_key
```

### 4. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 5. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- **Admin**: admin@eventmanager.com / admin123
- **Staff**: staff@eventmanager.com / staff123
- **User**: user@eventmanager.com / user123
- 6 sample events

### 6. Start the Application

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

## 👥 Roles & Features

### User
- Register & login
- Browse / search / filter events
- Book tickets (1-10 per event)
- View & download QR code tickets
- Cancel bookings (before event date)
- Receive booking confirmation email

### Admin
- Dashboard with analytics (users, events, bookings, attendance)
- Create / edit / delete events
- Set event capacity
- View all users & assign roles
- Track attendance logs
- Export attendance data as CSV

### Staff
- QR scanner interface (webcam/mobile camera)
- Validate ticket authenticity in real-time
- Auto-mark attendance on scan
- Prevent duplicate entry (same QR)
- View scan history

## 📊 Database Schema

| Table           | Key Columns                                   |
| --------------- | --------------------------------------------- |
| users           | id, name, email, password (bcrypt), role       |
| roles           | id, role_name (admin/user/staff)               |
| events          | id, title, description, location, event_date, capacity |
| bookings        | id (UUID), user_id, event_id, qr_code_data, booking_status |
| attendance_logs | id, booking_id, scan_time, scanned_by_staff_id |

## 🔐 API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current profile

### Events
- `GET /api/events` — List events (with search, filter, pagination)
- `GET /api/events/:id` — Get event details
- `POST /api/events` — Create event (admin)
- `PUT /api/events/:id` — Update event (admin)
- `DELETE /api/events/:id` — Delete event (admin)

### Bookings
- `POST /api/bookings` — Book tickets (user)
- `GET /api/bookings/my` — My bookings
- `PUT /api/bookings/:id/cancel` — Cancel booking
- `GET /api/bookings/:id/qr` — Get QR code

### Staff
- `POST /api/staff/scan` — Scan & validate QR
- `GET /api/staff/history` — Scan history

### Admin
- `GET /api/admin/dashboard` — Analytics
- `GET /api/admin/users` — All users
- `PUT /api/admin/users/:id/role` — Assign role
- `GET /api/admin/attendance` — Attendance logs
- `GET /api/admin/attendance/export` — CSV export

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy the `dist/` folder to Vercel
```

### Backend (Render)
- Set environment variables in Render dashboard
- Start command: `node server.js`
- Build command: `npm install`

### Database
- Use a managed MySQL service (PlanetScale, AWS RDS, etc.)
- Update `DB_HOST`, `DB_USER`, `DB_PASS` in backend `.env`

## 📧 Email Configuration (Optional)

To enable booking confirmation emails, configure SMTP in `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@eventmanager.com
```

The app works fully without email — it will log a skip message instead.
