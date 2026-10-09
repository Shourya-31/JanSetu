# JanSetu DMFT Census Platform - Fullstack Technical Documentation

## Executive Summary
**JanSetu** is an enterprise-grade fullstack web application and mobile-responsive census platform built for District Mineral Foundation Trust (DMFT) operations in Narayanpur. It provides comprehensive digital data collection, village baseline surveys, household census tracking, 5-year perspective planning, automated scheme gap matrix analytics, and admin audit workflows.

- **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS
- **Backend**: Fastify + Node.js + TypeScript + Prisma ORM + PostgreSQL 16
- **Scale Capability**: Optimized for up to **300 GB dataset size (~30M–50M records)** with sub-50ms search latency via GIN Trigram indexes and pre-computed Materialized Views.

---

## 1. Directory Structure & File Map

```
JanSetu/
├── README.md                      # Primary project overview & documentation
├── frontend/                      # Web UI Application (React 19 + Vite)
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── App.tsx                # Main UI application shell & view router
│   │   ├── main.tsx               # Client entry point
│   │   ├── index.css              # Tailwind CSS styles
│   │   ├── components/
│   │   │   ├── admin/             # Admin portal components
│   │   │   │   ├── AdminDashboard.tsx           # Primary admin overview & metrics
│   │   │   │   ├── AdminRecordsPage.tsx         # Household record table & audit modal
│   │   │   │   ├── AdminAnalyticsReportsPage.tsx # Scheme gap matrix & reports
│   │   │   │   └── AdminUI.tsx                  # Layout shell for admin portal
│   │   │   └── surveyor/          # Field surveyor survey modules
│   │   │       ├── LoginPage.tsx                # Surveyor login screen
│   │   │       ├── SurveyorDashboard.tsx        # Village selector & survey progress
│   │   │       ├── HouseholdAnalyticsDashboard.tsx # Household statistics & status
│   │   │       ├── VillageProfileDashboard.tsx  # Village infrastructure summary
│   │   │       ├── household/                   # DMFT 24-Section Household Survey
│   │   │       │   ├── HouseholdSurvey.tsx      # Household list & count selector
│   │   │       │   ├── HouseholdForm.tsx        # 11 sub-module container form
│   │   │       │   ├── general/                 # General info & head details
│   │   │       │   ├── demography/              # Member counts & age breakdown
│   │   │       │   ├── documents/               # Aadhaar, Caste, Ayushman, Voter IDs
│   │   │       │   ├── women/                   # JSY, PMMVY, Mahtari, Widow pension
│   │   │       │   ├── disability/              # Divyang assistance & equipment
│   │   │       │   ├── education/               # Vaccination, Anganwadi, Dropouts
│   │   │       │   ├── employment/              # Unemployed 18-45, PM-KISAN, Mining
│   │   │       │   ├── housing/                 # House type, toilet, tap water, solar
│   │   │       │   ├── health/                  # Chronic illness, free medicines
│   │   │       │   ├── shg/                     # Women SHG membership
│   │   │       │   └── other/                   # Top 2 urgent family needs
│   │   │       └── village-survey/              # Gram Parichay 11-Section Baseline Survey
│   │   │           ├── VillageSurveyForm.tsx    # Village baseline survey container
│   │   │           ├── general/                 # Land, population, SC/ST, PMAY
│   │   │           ├── anganbadi/               # Anganwadi centers & facilities
│   │   │           ├── school/                  # Schools, UDISE, dropouts, APAAR IDs
│   │   │           ├── hostel/                  # Ashram / Hostel facilities
│   │   │           ├── health/                  # Sub-centers & medical staff
│   │   │           ├── water/                   # Tap water, quality & water sources
│   │   │           ├── employment/              # Migration, ITI distance, skill trades
│   │   │           ├── ladies/                  # SHGs, bank distance & accounts
│   │   │           ├── cleanliness/             # Waste management & drainage
│   │   │           ├── pension/                 # Divyang, Widow & Elderly pensions
│   │   │           └── development/             # 5-Year perspective plan & needs
│   │   ├── data/
│   │   │   ├── adminMockData.ts                 # Fallback mock household & village records
│   │   │   └── narayanpurHierarchy.ts           # Block ➔ Panchayat ➔ Village mapping
│   │   ├── services/
│   │   │   └── adminApi.ts                      # Admin data query & filter helpers
│   │   ├── types/
│   │   │   ├── admin.ts                         # Admin & household record TypeScript interfaces
│   │   │   ├── auth.ts                          # Auth user & role types
│   │   │   └── survey.ts                        # Village survey data interfaces
│   │   └── utils/
│   │       └── csv.ts                           # CSV generation helper
└── backend/                       # REST API Server Engine (Fastify + PostgreSQL)
    ├── package.json
    ├── tsconfig.json
    ├── ecosystem.config.js
    ├── prisma/
    │   └── schema.prisma                  # PostgreSQL schema, models & index configs
    └── src/
        ├── server.ts                      # Fastify setup, compression & bg timers
        ├── config/
        │   └── prisma.ts                  # Prisma Client instance
        ├── controllers/
        │   ├── adminController.ts         # Dynamic search, filtering & analytics
        │   ├── authController.ts          # JWT authentication
        │   ├── exportController.ts        # Memory-efficient CSV streaming exporter
        │   ├── hierarchyController.ts     # Location dropdown hierarchy
        │   ├── householdController.ts     # Household survey CRUD & optimistic locks
        │   └── villageController.ts       # Village profile & baseline survey CRUD
        ├── routes/
        │   └── api.ts                     # HTTP route declarations
        ├── scripts/
        │   ├── deployInitDb.ts            # PostgreSQL tuning, GIN indexes & MView init
        │   └── backupDb.ts                # Backup utility
        └── utils/
            └── dbRetry.ts                 # Transaction backoff retry helper
```

---

## 2. Physical PDF Baseline Survey Alignment

### A. DMFT Household Baseline Survey Form (*Parivar Star Aadharbhoot Sarvekshan Prapatra*)
Covered across the **Household Survey Form** (`frontend/src/components/surveyor/household/`):
- **Demographics & Social**: Head name, mobile, caste (General, OBC, SC, ST, Abujhmadia PVTG), BPL status, total members, elders (60+), children (0-14), unemployed youth (18-45).
- **Entitlements & Documents**: Ration card, missing Aadhaar, e-KYC status, missing Caste Cert, missing Ayushman (PM-JAY), missing Voter ID, VB-G RAM G job card, Shramik card (18-40), Jan-Dhan bank account, KCC, Individual Vanadhikar patta, Marriage cert.
- **Maternal & Social Security**: JSY, PMMVY, Mahtari Vandana, Widow pension (40-79), Divyang pension.
- **Divyang Assistance**: Equipment required (crutches, wheelchair, hearing aid, tricycle, vision aid, artificial limb), death in past year + death cert, PM Garib Kalyan free ration.
- **Children & Education**: Birth cert, vaccination (0-5 yrs), Anganwadi hot meals, school attendance & drop reasons.
- **Livelihood & Income**: PM-KISAN, mining worker status, annual income band, primary income source, animal husbandry type, animal shed provided under scheme.
- **Housing & Sanitation**: House type (Kaccha, Pucca, Semi-Pucca), PMAY housing, toilet availability & usage, tap water connection & drinking water source (Well, River, Handpump, Pond, Spring), electricity, solar energy.
- **Health & Needs**: Cough/Asthma/TB illness, free hospital medicines, SHG membership, top 2 urgent family needs.

### B. Village Baseline Survey & 5-Year Perspective Plan Form (*Gram Parichay Prapatra*)
Covered across the **Village Baseline Survey** (`frontend/src/components/surveyor/village-survey/`):
- **General Info**: Population, total households, SC/ST pop, total schools, hospitals, Anganwadis, hostels, fair price shop, mobile network, all-weather road, monsoon cut-off, tap water deficit, PMAY housing progress, banking, agri land, ODF status.
- **Anganwadi Array**: 9 status questions per center (building type, condition, toilets, drinking water, electricity, nutrition garden).
- **Schools Array**: 19 questions per school (UDISE code, type, building condition, separate boys/girls toilets, dropout kids & reasons, APAAR ID missing count).
- **Hostels & Ashrams**: Facility type, building condition, toilet status.
- **Health Facilities**: Health center type, operation, medical staff, medicine supply, key deficiencies.
- **Drinking Water & Quality**: Tap water status, summer drinking water issues (turbidity, odor, iron, fluoride), distance to fetch water, pipeline/tank improvements needed.
- **Skill Development & Migration**: Unemployed youth count, migration destination/reason/duration, nearest ITI distance, skill training trades, top 2 needed training programs.
- **Women SHGs & Financial Inclusion**: Active SHGs, activities, bank loans, nearest bank distance.
- **Sanitation & Waste Management**: Household toilets, solid waste collection, drainage system.
- **Pensions**: Coverage for Divyang, Widow, and Elderly pensions.
- **5-Year Perspective Plan**: Handpumps needed, borewells needed, solar pumps needed, solar street lights count, road km needed, top 3 urgent village tasks.

---

## 3. Database Architecture & High-Performance Indexing

### Database Engine & Extensions
- **DBMS**: PostgreSQL 16
- **ORM**: Prisma Client
- **Extensions**: `pgcrypto` (UUIDs) & `pg_trgm` (GIN Trigram text search)

### Performance Index Declarations
1. **GIN Trigram Search Indexes**:
   - `idx_households_head_name_trgm` on `head_name`
   - `idx_households_mobile_trgm` on `mobile`
   - `idx_households_tracking_id_trgm` on `tracking_id`
   - `idx_households_village_name_trgm` on `village_name`
2. **GIN JSONB Path Index**:
   - `idx_households_survey_answers_gin` on `survey_answers (jsonb_path_ops)`
3. **Composite B-Tree Indexes**:
   - `idx_households_multi_filter` on `(village_name, is_bpl, caste, is_mining_worker)`
   - `idx_households_missing_docs` on `(missing_aadhaar, missing_ayushman, missing_caste_cert, missing_voter_id)`
4. **Materialized View**:
   - `mv_district_cluster_analytics`: Pre-aggregates district-wide total households, population, BPL counts, missing Aadhaar/Ayushman, and unemployed youth count.

---

## 4. API Endpoints Reference

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT | Public |
| `POST` | `/api/auth/demo-login` | Issue an eight-hour public demo surveyor JWT | Public |
| `GET` | `/api/hierarchy` | Location hierarchy (Block ➔ Panchayat ➔ Village) | Surveyor/Admin |
| `GET` | `/api/villages/all` | List all village profiles with completed survey counts | Surveyor/Admin |
| `GET` | `/api/villages/profile` | Retrieve a village profile and baseline survey | Surveyor/Admin |
| `POST` | `/api/villages/profile` | Create / update village profile and village survey | Surveyor/Admin |
| `PATCH` | `/api/villages/:id` | Partial update village profile with version lock | Surveyor/Admin |
| `DELETE` | `/api/villages/:id` | Delete village profile | Admin |
| `GET` | `/api/households` | Fetch household surveys for a village | Surveyor/Admin |
| `POST` | `/api/households/initialize` | Create household survey slots | Surveyor/Admin |
| `POST` | `/api/households` | Submit / upsert household survey data | Surveyor/Admin |
| `PATCH` | `/api/households/:id` | Update household survey record with version lock | Surveyor/Admin |
| `DELETE` | `/api/households/:id` | Delete household survey record | Admin |
| `PATCH` | `/api/households/:id/verify` | Update verification audit status | Admin |
| `PATCH` | `/api/households/:id/registry` | Update registry status | Admin |
| `POST` | `/api/households/:id/ticket` | Raise correction ticket | Admin |
| `POST` | `/api/admin/query` | Dynamic multi-filter & search query (max 500) | Admin |
| `GET` | `/api/admin/analytics` | Fetch pre-computed district analytics summary | Admin |
| `GET` | `/api/admin/audit-logs` | Fetch audit history | Admin |
| `GET` | `/api/admin/export` | Stream full household records CSV | Admin |

Demo surveyor access is public and can create or edit survey records. Those changes are marked as `DEMO-SURVEYOR` in audit-log changes, and admin endpoints continue to require an administrator JWT.

---

## 5. Local Setup & Running Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- A configured `backend/.env` with `DATABASE_URL`, a 32+ character `JWT_SECRET`, `CORS_ORIGIN`, and `INITIAL_USERS_JSON`.

### A. Running the Backend Server
```bash
# 1. Navigate to backend directory
cd JanSetu/backend

# 2. Install dependencies
npm install

# 3. Configure backend/.env from .env.example

# 4. Push the Prisma schema and initialize database indexes/materialized view
# Run only against a development database; this recreates the analytics view.
npm run db:init

# 5. Generate Prisma Client and seed the 290 affected villages
npm run db:generate
npm run db:seed-hierarchy

# 6. Install append-only audit protection and provision configured users
npm run db:install-audit-protection
npm run db:seed-users

# 7. Compile and start the development server
npm run build
npm run dev
```
*Backend server runs at `http://localhost:3000` by default (or the `PORT` specified in `.env`).*

---

### B. Running the Frontend UI App
```bash
# 1. Navigate to frontend directory
cd JanSetu/frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```
*Frontend app runs at `http://localhost:5173`.*
*The `/api` proxy targets `http://localhost:3000` by default; set `VITE_API_PROXY_TARGET` to override it for local backend ports.*




