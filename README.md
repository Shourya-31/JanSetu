# JanSetu - District Mineral Foundation Trust (DMFT) Survey & Admin Portal

JanSetu is a high-performance, strictly secured full-stack application designed to execute large-scale, offline-capable rural baseline surveys and provide real-time analytical dashboards for administrators. 

It is built specifically for the rigorous data collection requirements of District Mineral Foundation Trust (DMFT) operations, tracking household demographics, social security, health, education, and village-wide infrastructure.

---

## 1. Core Architecture Highlights

### ⚡ Blazing Fast Analytics (`O(1)` Lookups)
Instead of forcing the database to scan hundreds of thousands of household records every time the Admin Dashboard is opened, JanSetu uses **Denormalized Real-Time Counters**. Every time a surveyor submits a household survey, the backend intercepts the transaction and instantly increments counters (like `householdsFilled`, `totalHouseholds`) directly on the Village and Block tables. This ensures the admin dashboard loads instantly regardless of dataset size.

### 🔒 Bank-Grade Concurrency Protection
To prevent database corruption when hundreds of surveyors submit data simultaneously from the field, the system uses strict **PostgreSQL Advisory Locks** (`pg_advisory_xact_lock`). If two surveyors try to edit the same village or initialize overlapping household slots, the backend forces microsecond-level queuing to ensure perfect data integrity without causing table-wide deadlocks.

### 🛡️ Hardened Security Architecture
*   **In-Memory Auth:** JWT tokens are stored exclusively in Javascript memory (`AuthSession`) and never written to `localStorage` or `sessionStorage`. Refreshing the browser acts as an automatic, absolute logout.
*   **Env-Driven Single Sign-On:** Surveyor and Admin credentials are hard-coded into the backend server's `.env` file, bypassing complex database-driven user management and closing standard attack vectors.

---

## 2. API Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate using `.env` credentials and issue in-memory JWT | Public |
| `GET` | `/api/hierarchy` | Location hierarchy (Block ➔ Panchayat ➔ Village) | Surveyor/Admin |
| `GET` | `/api/villages/all` | List all villages | Surveyor/Admin |
| `POST` | `/api/villages/profile` | Upsert village profile & dynamically increment admin stats | Surveyor/Admin |
| `POST` | `/api/households/initialize` | Generate safe, unique household slots for a village | Surveyor/Admin |
| `POST` | `/api/households` | Upsert household data & dynamically increment admin stats | Surveyor/Admin |
| `POST` | `/api/upload/image` | Handle Cloudinary photo uploads for surveys | Surveyor/Admin |
| `GET` | `/api/admin/surveys` | Fetch deeply nested `SurveyDataset` (village + households) | Admin Only |
| `GET` | `/api/admin/gram-stats` | Instant O(1) district-wide dashboard analytics | Admin Only |

---

## 3. Local Setup & Deployment

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)

### A. Setting up the Backend
```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create your .env file
# Copy .env.example (or manually create .env) and set:
# - DATABASE_URL="postgres://user:pass@localhost:5432/jansetu"
# - JWT_SECRET="your-32-char-secret"
# - ADMIN_USERNAME, ADMIN_PASSWORD
# - SURVEYOR_USERNAME, SURVEYOR_PASSWORD

# 4. Push the schema to your fresh database
# This creates all tables instantly. No separate migration scripts needed.
npx prisma db push

# 5. Compile and run
npm run build
npm run dev
```
*Backend server runs at `http://localhost:3000`.*

### B. Setting up the Frontend
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```
*Frontend app runs at `http://localhost:5173`. In development, Vite will automatically proxy `/api` to port 3000.*

---

## 4. Production Deployment Notes
1. **Frontend Proxy:** For production builds on platforms like Vercel/Netlify, the Vite dev proxy is disabled. Ensure you set `VITE_API_BASE_URL="https://your-backend.com"` in your environment variables.
2. **Database Start:** Always ensure your PostgreSQL service boots up **before** the Fastify backend engine, as the backend establishes connection pools immediately on startup.
3. **Data Protection:** The `schema.prisma` is heavily protected by Relational Constraints (Cascading is disabled by default). You cannot accidentally delete a Block or Village if there is Survey data attached to it. The structure is final and production-ready.
