# 🚗 UOL Ride Share

A modern ride-sharing platform exclusively for University of Lahore students. Share rides, split costs, and reduce your carbon footprint.

## 🎯 Features

- ✅ **Secure UOL Email Authentication** - Only @student.uol.edu.pk emails allowed
- 🔍 **Smart Ride Matching** - Find rides by origin area, destination, and date
- 🚙 **Post & Manage Rides** - Offer rides with flexible seating and pricing
- 🎫 **Easy Booking** - Book seats in seconds with real-time availability
- ⭐ **User Ratings** - Build trust with the community rating system
- 🔔 **In-App Notifications** - Stay updated on bookings, cancellations, and more
- 💵 **Cash Payments** - No payment gateway needed; settle costs directly

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16
- SMTP credentials (Gmail recommended)

### 1. Database Setup

```bash
# Create database
createdb uol_rideshare

# Or using psql
psql -U postgres -c "CREATE DATABASE uol_rideshare;"
```

### 2. Backend Setup

```bash
cd backend

# Copy environment file
copy .env.example .env

# Edit .env with your credentials:
# - DATABASE_URL=postgresql://user:pass@localhost:5432/uol_rideshare
# - JWT_SECRET=your_random_secret_here
# - SMTP_HOST, SMTP_USER, SMTP_PASS (Gmail: smtp.gmail.com:587)

# Run database migrations
npm run db:migrate

# Start backend server
npm run dev
```

Backend will run at: **http://localhost:4000**

### 3. Frontend Setup

```bash
cd frontend

# Start frontend dev server
npm run dev
```

Frontend will run at: **http://localhost:5173**

## 🌐 Access the Application

Open your browser and navigate to: **http://localhost:5173**

### Test Account Creation

1. Click **Sign Up**
2. Register with a `@student.uol.edu.pk` email
3. Check email for verification link (or check console for dev token)
4. Verify and login

## 📁 Project Structure

```
uol-rideshare/
├── backend/
│   ├── src/
│   │   ├── config/       # Environment config
│   │   ├── db/           # Database connection & migrations
│   │   ├── middleware/   # Auth, error handling
│   │   ├── modules/      # Feature modules (auth, rides, bookings, ratings)
│   │   ├── utils/        # Email, notifications
│   │   └── app.ts        # Express app entry
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/          # Axios config
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route pages
│   │   ├── store/        # Zustand state management
│   │   ├── App.tsx       # React Router setup
│   │   └── main.tsx      # React entry
│   └── package.json
└── README.md
```

## 🔧 Tech Stack

### Backend
- Node.js + Express + TypeScript
- PostgreSQL (raw SQL, no ORM)
- JWT authentication
- bcrypt password hashing
- Nodemailer for emails
- Zod validation

### Frontend
- React 18 + TypeScript
- Vite (fast dev server)
- TanStack Query (data fetching)
- Zustand (state management)
- React Router v6
- Tailwind CSS (styling)
- React Hot Toast (notifications)

## 📜 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/verify-email` - Verify email token
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users/me` - Get own profile
- `PATCH /api/users/me` - Update profile
- `GET /api/users/:id` - Get public profile

### Rides
- `POST /api/rides` - Post a ride
- `GET /api/rides/search` - Search rides
- `GET /api/rides/:id` - Get ride details
- `GET /api/rides/mine` - Get my posted rides
- `PATCH /api/rides/:id/cancel` - Cancel ride
- `PATCH /api/rides/:id/complete` - Mark complete

### Bookings
- `POST /api/bookings` - Book a seat
- `GET /api/bookings/mine` - Get my bookings
- `PATCH /api/bookings/:id/cancel` - Cancel booking

### Ratings
- `POST /api/ratings` - Submit rating
- `GET /api/ratings/user/:userId` - Get user ratings

### Notifications
- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all read

## 🔐 Security Features

- Email domain verification (@student.uol.edu.pk only)
- Password hashing with bcrypt (cost factor 12)
- JWT session tokens with server-side invalidation
- Rate limiting on auth endpoints
- Parameterized SQL queries
- Input validation with Zod
- CORS protection
- Row-level locking for bookings (prevents double-booking)

## 📝 Business Rules

- Only verified UOL students can access the platform
- Drivers can have at most 1 active ride at a time
- Seats: 1–4 per ride
- Departure time must be in the future
- Bookings cancellable up to 1 hour before departure
- Drivers can't book their own rides
- Ratings: 1–5 stars, submitted after ride completion
- Notifications persist for offline users

## 🎨 UI Highlights

- Modern gradient-based design
- Responsive mobile-first layout
- Real-time notification badge
- Smooth animations and transitions
- Toast notifications for user feedback
- Star rating system
- Search filters with date picker
- Profile photo uploads

## 🛠️ Development

### Run Backend in Dev Mode
```bash
cd backend
npm run dev
```

### Run Frontend in Dev Mode
```bash
cd frontend
npm run dev
```

### Build for Production
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## 📦 Environment Variables

### Backend (.env)
```
PORT=4000
DATABASE_URL=postgresql://postgres:password@localhost:5432/uol_rideshare
JWT_SECRET=your_256_bit_random_secret
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
UPLOAD_DIR=uploads
```

## 🐛 Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in .env
- Run migrations: `npm run db:migrate`

### Email Not Sending (Dev)
- Check SMTP credentials in .env
- For Gmail: Enable 2FA and create App Password
- In dev mode, token is logged to console

### Frontend Can't Connect to Backend
- Ensure backend is running on port 4000
- Check vite proxy config in vite.config.ts
- Try accessing http://localhost:4000/api/health

## 📄 License

This project is built for educational purposes at University of Lahore.

## 👨‍💻 Author

Built with ❤️ for UOL Students

---

**Start both servers and access the app at: http://localhost:5173**
