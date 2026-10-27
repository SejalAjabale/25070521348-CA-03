# Apex Detailed Wash - Full-Stack Automotive Care Platform

A full-stack, enterprise-grade appointment booking and management platform for **Apex Detailed Wash** — high-performance automotive care, ceramic coating, and precision detailing.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Key Features](#key-features)
- [Architecture & Repository Structure](#architecture--repository-structure)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Installation & Quick Start](#installation--quick-start)
- [Running Backend & Frontend](#running-backend--frontend)
- [Authentication System & Security](#authentication-system--security)
- [API Documentation](#api-documentation)
- [Testing Suite](#testing-suite)
- [Deployment Readiness](#deployment-readiness)

---

## Project Overview

**Apex Detailed Wash** provides supercar-grade detailing and paint protection for everyday drivers and luxury automotive enthusiasts. 

The application solves key operational and customer-experience challenges:
1. **Seamless Online Scheduling**: Interactive package selector (Express, Ceramic Detail, Deep Spa, Paint Correction), real-time time slot booking, and calendar date guards (preventing scheduling in the past).
2. **End-to-End User Authentication**: Secure registration and login powered by salted **bcryptjs** password hashing and **JSON Web Tokens (JWT)**.
3. **Role-Based Pipeline Management**:
   - **Customers**: Manage their own reservations, view status progression (Pending → In Progress → Completed), track vehicle service history, and update their profile.
   - **Staff & Administrators**: Live dispatch control with real-time status transitions (Start Wash, Mark Completed, Cancel, or Delete records) and dashboard revenue & volume metrics.
4. **Guest & Unauthenticated Lookup**: Non-registered customers can book and look up their service schedule via their email address.

---

## Technology Stack

### Frontend
- **Framework**: React 19 (Create React App)
- **Styling**: Vanilla CSS3 with Modern Glassmorphism, Dark Mode, and CSS Custom Properties
- **Icons**: Lucide React
- **HTTP Client**: Axios with automated Bearer Token interceptor
- **State Management**: React Context API (`AuthContext`) with persistent `localStorage` session management
- **Testing**: React Testing Library & Jest

### Backend
- **Runtime**: Node.js
- **Server Framework**: Express 5
- **Database**: MongoDB via Mongoose 9 ODM
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs`
- **Security & Config**: CORS, `dotenv`, sanitized inputs, and role-based middleware

---

## Architecture & Repository Structure

```
25070521348-CA-03/
├── .gitignore                    # Root gitignore protecting secrets, builds, and node_modules
├── README.md                     # Comprehensive project documentation
│
├── client/                       # React Frontend Application
│   ├── public/                   # Public static assets & index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── apiClient.js      # Centralized Axios client with JWT interceptors
│   │   ├── context/
│   │   │   └── AuthContext.js    # Authentication context, session handling, user state
│   │   ├── components/
│   │   │   ├── Navbar.js         # Responsive navigation bar with mobile drawer
│   │   │   ├── BookingForm.js    # Appointment scheduling form & summary card
│   │   │   ├── BookingHistory.js # Searchable appointment logs & pipeline controls
│   │   │   ├── ServicePackages.js# Package comparison cards with direct booking
│   │   │   ├── AboutSection.js   # Guarantees, testimonials, and facility info
│   │   │   ├── LoginModal.js     # Login modal with show/hide password & forgot password
│   │   │   ├── SignupModal.js    # Signup modal with strength meter & validation
│   │   │   ├── ProfileModal.js   # Profile & password management modal
│   │   │   └── Toast.js          # Animated toast notifications
│   │   ├── App.js                # Core application assembly & tab router
│   │   ├── App.css               # Premium dark glassmorphism styling
│   │   ├── App.test.js           # Frontend integration tests (6 tests)
│   │   └── index.js              # React DOM entrypoint
│   ├── .env.example              # Frontend environment variables template
│   └── package.json
│
└── server/                       # Node.js & Express Backend API
    ├── models/
    │   ├── User.js               # User schema with pre-save bcrypt hook & comparePassword
    │   └── Booking.js            # Booking schema with user reference & pricing
    ├── routes/
    │   ├── auth.js               # Register, login, me, profile, change-password, forgot-password
    │   └── bookings.js           # CRUD bookings, role filtering, search, and stats
    ├── middleware/
    │   └── auth.js               # JWT verification & role authorization middleware
    ├── server.js                 # Express server configuration & MongoDB connector
    ├── test-auth.js              # Automated backend test suite (10 tests)
    ├── .env.example              # Backend environment variables template
    └── package.json
```

---

## Prerequisites

- **Node.js**: v18.x or later
- **npm**: v9.x or later
- **MongoDB**: Local MongoDB instance running on port 27017 or a MongoDB Atlas URI

---

## Environment Configuration

### Backend Configuration (`server/.env`)
Create `server/.env` based on `server/.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/car_wash_db
JWT_SECRET=apex_car_wash_jwt_secret_key_change_me_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### Frontend Configuration (`client/.env`)
Create `client/.env` based on `client/.env.example`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

> **Security Note**: Never commit actual `.env` files. Both root `.gitignore` and `client/.gitignore` ensure `.env*` files remain strictly local.

---

## Installation & Quick Start

1. Clone or navigate to the repository:
   ```bash
   cd 25070521348-CA-03
   ```

2. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../client
   npm install
   ```

---

## Running Backend & Frontend

### 1. Start MongoDB
Ensure MongoDB is running locally:
```bash
# Windows Service check:
Get-Service MongoDB
```

### 2. Start Backend Server
```bash
cd server
npm start
# Server listens on http://localhost:5000
```

### 3. Start Frontend Application
```bash
cd client
npm start
# App opens at http://localhost:3000
```

---

## Authentication System & Security

### Security Features
- **Password Hashing**: Pre-save hook using `bcryptjs` with 10 salt rounds. Passwords are never stored or logged in plain text.
- **JWT Protection**: Signed tokens with configurable expiration (`7d`).
- **Authorization Interceptor**: Automatic `Bearer <token>` injection for all authenticated API requests.
- **Role Differentiation**:
  - `admin`: Full dispatch control, appointment modification, and system metrics.
  - `staff`: Appointment status progression (Start Wash, Complete Wash).
  - `customer`: Scoped access to personal appointments and profile details.
- **Safe JSON Serializer**: Password hashes are stripped before serialization.

---

## API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Private | Retrieve authenticated user profile |
| `PUT` | `/api/auth/profile` | Private | Update user details (name, phone, preferred vehicle) |
| `POST` | `/api/auth/change-password` | Private | Change password with current password verification |
| `POST` | `/api/auth/forgot-password` | Public | Request password reset instructions |

### Bookings (`/api/bookings`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/bookings` | Public/Auth | Create appointment (links user if authenticated) |
| `GET` | `/api/bookings` | Public/Auth | List appointments (filtered by user role/guest email) |
| `GET` | `/api/bookings/stats` | Public/Auth | Dashboard metrics (pending, completed, revenue) |
| `GET` | `/api/bookings/:id` | Public | Get single booking details |
| `PATCH` | `/api/bookings/:id/status` | Public/Auth | Update status (`Pending`, `In Progress`, `Completed`, `Cancelled`) |
| `DELETE` | `/api/bookings/:id` | Public/Auth | Delete or cancel an appointment record |

---

## Testing Suite

### Backend Automated Tests
Run the 10-step backend integration test:
```bash
cd server
npm test
```
Tests verified:
1. Health check status (`200 OK`)
2. User Registration (`201 Created` + JWT token)
3. Duplicate email rejection (`409 Conflict`)
4. Login with valid credentials (`200 OK`)
5. Bad password rejection (`401 Unauthorized`)
6. Protected `/api/auth/me` access with Bearer token (`200 OK`)
7. Protected route without token rejection (`401 Unauthorized`)
8. Appointment creation linked to user (`201 Created`)
9. Scoped user appointment fetching (`200 OK`)
10. Appointment status update to `Completed` (`200 OK`)

### Frontend Automated Tests
Run the React Testing Library suite:
```bash
cd client
npm test
```
Tests verified:
1. Brand header and navigation tabs rendering
2. Appointment metrics cards rendering
3. Reservation form controls rendering
4. Login modal activation and controls
5. Signup modal activation and controls
6. Interactive tab switching and package display

---

## Deployment Readiness

To produce an optimized production bundle:
```bash
cd client
npm run build
```
The output in `client/build/` is minified, hashed, and ready for deployment to Vercel, Netlify, or any static hosting service with the Node.js API hosted on Render, Railway, or AWS.
