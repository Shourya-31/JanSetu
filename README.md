# JanSetu

JanSetu is a full-stack **District Mineral Foundation Trust (DMFT) village and household census platform** for Narayanpur district. It provides two role-based experiences:

- **Field surveyors** collect village-level and household-level baseline information.
- **Administrators** review, verify, filter, analyse, and export collected records.

The application is designed for structured rural data collection covering demographics, documentation and welfare schemes, education, employment, health, housing, water, sanitation, social security, village infrastructure, and development needs.

## Table of contents

1. [Capabilities](#capabilities)
2. [Technology stack](#technology-stack)
3. [Architecture](#architecture)
4. [Application workflows](#application-workflows)
5. [Data model](#data-model)
6. [Repository structure](#repository-structure)
7. [Prerequisites](#prerequisites)
8. [Run with Docker Compose](#run-with-docker-compose)
9. [Run locally without Docker](#run-locally-without-docker)
10. [Environment configuration](#environment-configuration)
11. [HTTP API](#http-api)
12. [Database operations](#database-operations)
13. [Testing and quality checks](#testing-and-quality-checks)
14. [Production and operations](#production-and-operations)
15. [Troubleshooting](#troubleshooting)

## Capabilities

### Surveyor workspace

- Login as a surveyor and select the survey mode.
- Browse the seeded Block → Gram Panchayat → Village hierarchy.
- Complete a village survey through section-based forms.
- Initialize household slots for a village.
- Capture and update household records, including:
  - General information and demographics
  - Caste, BPL, and mining employment
  - Aadhaar, caste certificate, Ayushman, voter ID, ration, and labour-card availability
  - Education and employment
  - Health and disability information
  - Housing, toilet, tap-water, electricity, and other facilities
  - Women’s social security and self-help groups
  - Welfare schemes and priority needs
- Upload survey photographs through the configured Cloudinary integration.
- Review village and household progress and report views.

### Administrator workspace

- View district and gram-level progress counters.
- Inspect village surveys and nested household survey data.
- Search and filter household records by geography, BPL status, caste, mining employment, missing documents, unemployment, audit status, registry status, correction tickets, house number, and free-text search.
- Verify household records and assign verification results.
- Update registry status.
- Create correction tickets with a reason and optional note.
- Review audit logs for village and household changes.
- View analytics summaries and consolidated administrative reports.
- Export filtered household data as CSV.
- Delete village or household records when authorized.

### Reliability and security features

- Fastify request validation with JSON schemas and bounded input sizes.
- JWT authentication with separate administrator and surveyor roles.
- Administrator-only authorization for review, verification, registry, ticket, audit, export, and delete operations.
- Helmet security headers, CORS configuration, compression, and rate limiting.
- PostgreSQL foreign-key relationships and uniqueness constraints.
- Optimistic version fields on editable survey records.
- Audit-log persistence for survey changes.
- Village, block, and Gram Panchayat counters for fast progress dashboards.
- Graceful shutdown of the Fastify server and Prisma connection.

## Technology stack

### Frontend

- **React 19** with functional components and hooks
- **TypeScript 6**
- **Vite 8** for development and production bundling
- **Tailwind CSS 4** through `@tailwindcss/vite`
- **Lucide React** for icons
- **ExcelJS** for client-side report/export support
- **clsx** and **tailwind-merge** for class-name composition
- **ESLint 10** with React Hooks and React Refresh plugins
- **Nginx Alpine** for the production static-file server and reverse proxy

### Backend

- **Node.js 22** runtime
- **TypeScript 5.8**
- **Fastify 4** REST API
- Fastify plugins:
  - `@fastify/jwt` for JWT tokens
  - `@fastify/cors` for cross-origin policy
  - `@fastify/helmet` for security headers
  - `@fastify/compress` for Brotli/Gzip/Deflate responses
  - `@fastify/rate-limit` for request throttling
  - `@fastify/multipart` for file uploads
  - `@fastify/postgres` for PostgreSQL pooling
- **Prisma 5** and `@prisma/client` for typed database access
- **node-postgres (`pg`)** for direct PostgreSQL operations and operational scripts
- **Cloudinary SDK** for image uploads
- **tsx** for TypeScript development scripts
- **PM2** for optional clustered process management

### Database and infrastructure

- **PostgreSQL 17 Alpine** in the Docker Compose deployment
- **Prisma Schema** as the database model source
- **Docker Compose** for local multi-service orchestration
- **Docker** multi-stage builds
- **Nginx** serving the frontend and proxying `/api/` and `/health`
- Optional PostgreSQL extensions and indexes created by the production initialization script:
  - `pgcrypto`
  - `pg_trgm`
  - GIN trigram/JSON indexes
  - Composite and filtered household indexes
  - A district analytics materialized view

## Architecture

```text
Browser
  │
  ├── Local development: Vite :5173 ── /api proxy ──┐
  │                                                  │
  └── Docker deployment: Nginx :8080 ── /api proxy ──┤
                                                     ▼
                                           Fastify API :3000
                                                     │
                          ┌──────────────────────────┴──────────────────────────┐
                          ▼                                                     ▼
                    Prisma Client                                      Cloudinary (optional)
                          │                                             survey photographs
                          ▼
                    PostgreSQL :5432
```

### Docker Compose services

| Service | Image/build | Internal port | Host port | Purpose |
|---|---|---:|---:|---|
| `postgres` | `postgres:17-alpine` | 5432 | Not published | Persistent survey database |
| `backend` | `backend/Dockerfile` | 3000 | Not published | Fastify API and authentication |
| `frontend` | `frontend/Dockerfile` + Nginx | 80 | 8080 | React application and API reverse proxy |

The PostgreSQL data is stored in the named `postgres_data` volume. The repository `backups` directory is mounted read-only into the database container at `/backups`.

## Application workflows

### Surveyor workflow

1. Open the application and select the surveyor profile.
2. Authenticate with the configured surveyor credentials.
3. Select a village from the location hierarchy.
4. Complete or update the village survey sections.
5. Initialize the required number of household slots.
6. Complete household forms and save progress.
7. Upload relevant photographs where required.
8. Review village/household progress and reports.

### Administrator workflow

1. Open the application and select administrator login.
2. Authenticate with the configured administrator credentials.
3. Review district, block, Gram Panchayat, and village progress.
4. Query or filter household records.
5. Verify records, change registry status, or create correction tickets.
6. Inspect audit history and analytics.
7. Export the selected dataset as CSV.

## Data model

The Prisma schema is in [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma).

### Main entities

- `User`: application users and their `surveyor` or `admin` role.
- `Block`: top-level administrative unit and aggregate counters.
- `GramPanchayat`: Panchayat within a block and aggregate counters.
- `Village`: village identity, affected status, population, household totals, and hierarchy relationship.
- `VillageSurvey`: one village-level survey per village. It stores section progress, completion state, general information, water, employment, health, school, Anganwadi, hostel, women’s, pension, cleanliness, and development data, plus photographs.
- `HouseholdSurvey`: one household record per village/house-number combination. It stores tracking information, demographics, welfare-document status, education, employment, health, housing, social security, survey answers, completion state, verification state, and correction-ticket state.
- `SurveyAuditLog`: timestamped change trail for village and household entities.

### Important constraints

- A village belongs to one Gram Panchayat; a Gram Panchayat belongs to one block.
- A village can have one `VillageSurvey`.
- A household’s house number is unique within its village.
- Village and household relationships use restrictive deletes to avoid removing parent geography that still has survey data.
- Survey records include a `version` field used by update/finalization flows.
- Household records have indexes for village, caste, BPL, mining employment, audit status, registry status, correction tickets, submission time, head name, and mobile number.

The location seed data is maintained in [`frontend/src/data/narayanpurHierarchy.ts`](frontend/src/data/narayanpurHierarchy.ts) and loaded by the backend hierarchy seeding script.

## Repository structure

```text
.
├── compose.yaml                 # PostgreSQL, backend, and frontend orchestration
├── .env                         # Local Compose database variables; keep private
├── backups/                     # Database dumps/backups
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── prisma/schema.prisma     # Database schema
│   ├── src/server.ts            # Fastify bootstrap and plugins
│   ├── src/routes/api.ts        # Route registration and validation
│   ├── src/controllers/         # Authentication, surveys, reports, uploads
│   ├── src/config/              # Prisma configuration
│   ├── src/scripts/             # Initialization, seeding, backup utilities
│   └── test/                    # Backend API validation tests
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf               # Production SPA and API reverse proxy
│   ├── vite.config.ts
│   └── src/
│       ├── components/admin/    # Administrator dashboard and reports
│       ├── components/surveyor/ # Login, survey, household, and reports
│       ├── services/            # API clients
│       ├── types/               # Shared frontend domain types
│       └── utils/               # Analytics, exports, CSV, and form helpers
└── README.md
```

## Prerequisites

### Docker deployment

- Docker Desktop with the Compose plugin
- At least 2 GB of available memory for the services

### Local development

- Node.js 22 or a compatible modern Node.js release
- npm
- PostgreSQL 14 or newer
- PostgreSQL client utilities (`pg_dump`) for database backups

## Run with Docker Compose

The recommended way to run the complete application is Docker Compose.

### 1. Configure private variables

Create the root `.env` file from [`.env.example`](.env.example). This file is read by
Docker Compose for the PostgreSQL container:

```dotenv
POSTGRES_USER=your_local_postgres_user
POSTGRES_PASSWORD=use_a_strong_local_password
POSTGRES_DB=jansetu
```

Create `backend/.env` from [`backend/.env.example`](backend/.env.example) for the
backend secrets and service settings:

```dotenv
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/jansetu?schema=public
JWT_SECRET=at_least_32_random_characters
CORS_ORIGIN=http://localhost:8080
ADMIN_USERNAME=change-this-admin-name
ADMIN_PASSWORD=change-this-admin-password
SURVEYOR_USERNAME=change-this-surveyor-name
SURVEYOR_PASSWORD=change-this-surveyor-password

# Required only when image uploads are used
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

The Compose service overrides `DATABASE_URL` inside the backend container so that it uses the `postgres` service name rather than `localhost`. Do not commit real credentials, JWT secrets, Cloudinary secrets, or production connection strings.

The Compose deployment also runs a one-shot `db-init` service after PostgreSQL is
healthy. It applies the Prisma schema, PostgreSQL extensions/indexes, and analytics
view, then seeds the Narayanpur Block → Gram Panchayat → Village hierarchy. The
backend starts only after that initialization succeeds. Environment-managed login
credentials are provisioned on the first successful login; no separate user seed
command is required for the normal Compose flow.

### 2. Build and start from the repository root

Run these commands after changing into the cloned repository. Running `docker compose`
from `/home/ubuntu` or another directory will not find this project's `compose.yaml`.

```powershell
cd /home/ubuntu/JanSetu
docker compose up -d --build
docker compose ps
```

Open:

- Application: <http://127.0.0.1:8080>
- Backend health through Nginx: <http://127.0.0.1:8080/health>

View logs:

```powershell
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

Stop the application without deleting database data:

```powershell
docker compose down
```

Do **not** use `docker compose down -v` unless you intentionally want to delete the persistent PostgreSQL volume.

## Run locally without Docker

### 1. Start PostgreSQL

Create a PostgreSQL database and set a local connection string in `backend/.env`:

```dotenv
DATABASE_URL=postgresql://user:password@localhost:5432/jansetu?schema=public
```

### 2. Install and initialize the backend

```powershell
cd backend
npm install
npx prisma generate
npx prisma db push
```

Optional data initialization:

```powershell
npm run db:seed-hierarchy
npm run db:seed-users
```

`db:seed-users` requires `INITIAL_USERS_JSON` containing a JSON array of users with `userCode`, `fullName`, `role`, and a password of 12–128 characters. The normal login controller uses the environment-managed administrator and surveyor credentials; use the database seeding workflow only when the deployment is configured to use those provisioned users.

Start the backend in watch mode:

```powershell
npm run dev
```

The API listens on <http://localhost:3000>.

### 3. Install and start the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The Vite application listens on <http://localhost:5173>. Vite proxies `/api` requests to `http://localhost:3000`, so no frontend API URL is required for the standard local setup.

For a frontend build preview:

```powershell
npm run build
npm run preview
```

## Environment configuration

### Backend variables

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | No | Runtime mode; development enables more verbose logging |
| `HOST` | No | Listen host; defaults to `0.0.0.0` |
| `PORT` | No | API port; defaults to `3000` |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | JWT signing secret; startup rejects values shorter than 32 characters |
| `CORS_ORIGIN` | Recommended | Comma-separated allowed origins; development defaults to Vite |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Yes for admin login | Environment-managed administrator credentials |
| `SURVEYOR_USERNAME` / `SURVEYOR_PASSWORD` | Yes for surveyor login | Environment-managed surveyor credentials |
| `CLOUDINARY_CLOUD_NAME` | For uploads | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | For uploads | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | For uploads | Cloudinary API secret |
| `RATE_LIMIT_MAX` | No | Global requests allowed per rate-limit window |
| `RATE_LIMIT_WINDOW` | No | Global rate-limit window |
| `COMPRESS_THRESHOLD` | No | Response-size threshold before compression |
| `CONNECTION_TIMEOUT` | No | Fastify connection timeout in milliseconds |
| `KEEP_ALIVE_TIMEOUT` | No | Fastify keep-alive timeout in milliseconds |
| `INITIAL_USERS_JSON` | Only for `db:seed-users` | JSON array used to provision database users |
| `PG_DUMP_PATH` | No | Optional explicit path to the `pg_dump` executable |

### Frontend variables

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Optional API base URL for deployments where the API is not served from the same origin |

When the frontend is served by the included Nginx configuration, leave `VITE_API_BASE_URL` empty and use the same-origin `/api` proxy.

## HTTP API

All endpoints are prefixed with `/api`. Except for login, endpoints require a valid Bearer JWT. Administrator-only endpoints additionally require the `admin` role.

### Authentication and hierarchy

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticate as `admin` or `surveyor`; returns an 8-hour JWT |
| `GET` | `/api/hierarchy` | Authenticated | Return the Block → Gram Panchayat → Village hierarchy |
| `POST` | `/api/upload/image` | Authenticated | Upload a survey image through Cloudinary |

### Village surveys

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/villages/all` | Authenticated | List village profiles |
| `GET` | `/api/villages/profile` | Authenticated | Read a village profile by supported query filters |
| `POST` | `/api/villages/profile` | Authenticated | Create or update village profile data |
| `POST` | `/api/villages/:id/finalize` | Authenticated | Finalize a village survey using its version |
| `PATCH` | `/api/villages/:id` | Authenticated | Partially update a village survey using its version |
| `DELETE` | `/api/villages/:id` | Admin | Delete a village survey/profile |

### Household surveys

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/households?villageName=...` | Authenticated | List household surveys for a village |
| `POST` | `/api/households/initialize` | Authenticated | Create household slots for a village |
| `POST` | `/api/households` | Authenticated | Create or save a household survey |
| `PATCH` | `/api/households/:id` | Authenticated | Partially update a household using its version |
| `DELETE` | `/api/households/:id` | Admin | Delete a household record |
| `PATCH` | `/api/households/:id/verify` | Admin | Set the household verification result |
| `PATCH` | `/api/households/:id/registry` | Admin | Update registry status |
| `POST` | `/api/households/:id/ticket` | Admin | Create a correction ticket |

### Administration and reporting

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/admin/surveys?blockId=...` | Admin | Read nested survey data for an administrative block |
| `GET` | `/api/admin/gram-stats` | Admin | Read aggregate gram-level statistics |
| `POST` | `/api/admin/query` | Admin | Filter and search household records |
| `GET` | `/api/admin/analytics` | Admin | Read analytics summary data |
| `GET` | `/api/admin/audit-logs` | Admin | Read paginated audit logs |
| `GET` | `/api/admin/export` | Admin | Export filtered household records as CSV |

The backend also exposes `GET /health`, returning service status, runtime environment, uptime, and a timestamp. The Docker health checks use this endpoint.

## Database operations

### Prisma commands

From `backend/`:

```powershell
npx prisma generate       # Generate the typed Prisma client
npx prisma db push        # Synchronize the schema with a database
```

This project currently uses `prisma db push` for schema synchronization rather than a checked-in Prisma migration history. Review and back up the database before applying schema changes in a shared or production environment.

### Initialization and seeding scripts

| npm script | Purpose |
|---|---|
| `npm run db:init` | Push the Prisma schema and apply PostgreSQL tuning, indexes, extensions, and the analytics materialized view |
| `npm run db:install-audit-protection` | Install the project’s audit-protection database objects |
| `npm run db:seed-hierarchy` | Seed Narayanpur’s Block, Gram Panchayat, and Village hierarchy |
| `npm run db:seed-users` | Upsert initial database users from `INITIAL_USERS_JSON` |
| `npm run db:backup` | Create a PostgreSQL dump using `pg_dump` |

### Backup and restore

Create a backup from `backend/`:

```powershell
npm run db:backup
```

The backup script uses `DATABASE_URL`, or the `PGUSER`/`PGDATABASE` variables and PostgreSQL client defaults when applicable. Store generated dumps securely because they contain survey data.

A typical PostgreSQL restore uses `pg_restore` for a custom-format dump:

```powershell
pg_restore --clean --if-exists --no-owner `
  --dbname="postgresql://user:password@localhost:5432/jansetu" `
  path\to\backup.dump
```

Confirm the dump format and target database before running destructive restore flags.

## Testing and quality checks

### Backend

```powershell
cd backend
npm test
npm run build
```

`npm test` runs `test/apiValidation.test.ts` with Node’s test runner through `tsx`. The build compiles `src/` into `dist/`.

### Frontend

```powershell
cd frontend
npm run lint
npm run build
```

The frontend package also includes `npm run test:admin` for the administrative report test script and `npm run catalog:admin` for generating the admin survey catalog.

## Production and operations

- Build the backend and frontend using the included Dockerfiles rather than relying on development servers.
- Keep PostgreSQL private; Compose intentionally does not publish port 5432 to the host.
- Keep the backend private behind Nginx or another trusted reverse proxy.
- Set an explicit `CORS_ORIGIN` in production.
- Use a strong, randomly generated `JWT_SECRET` of at least 32 characters.
- Replace all development/default login credentials before deployment.
- Do not commit `.env` files, database dumps, JWT secrets, or Cloudinary credentials.
- Use HTTPS at the external reverse proxy/load balancer.
- Back up PostgreSQL before schema changes, restores, or maintenance.
- Monitor `/health`, container health status, backend logs, database storage, and backup freshness.
- Do not remove the `postgres_data` volume during routine shutdown.

The backend supports optional PM2 startup:

```powershell
cd backend
npm run build
npm run start:cluster
```

Use PM2 only for a non-container deployment where process supervision is required.

## Troubleshooting

### The frontend cannot reach the API

1. Confirm the backend is listening on port 3000.
2. In Docker, confirm `docker compose ps` reports `backend` as healthy.
3. In local development, confirm Vite is running on port 5173 and the backend is running on port 3000.
4. For a separate frontend/API deployment, set `VITE_API_BASE_URL` and configure backend `CORS_ORIGIN`.

### The backend exits during startup

- Verify `DATABASE_URL` is present and points to a reachable PostgreSQL instance.
- Verify `JWT_SECRET` is at least 32 characters.
- Check whether port 3000 is already in use.
- Review `docker compose logs backend` or the local terminal output.

### Docker reports an unhealthy backend

- Check PostgreSQL health first: `docker compose logs postgres`.
- Confirm the database credentials in the root `.env`.
- Confirm the backend container can resolve the Compose hostname `postgres`.
- Check `http://127.0.0.1:8080/health` through the frontend proxy.

### Database tables or hierarchy are missing

The normal Compose startup runs both initialization steps automatically. To rerun
them manually after changing the schema or hierarchy, use:

```powershell
docker compose run --rm db-init
```

For local development without Docker, run the scripts from `backend/`:

```powershell
npm run db:init
npm run db:seed-hierarchy
```

### Image upload fails

Verify all three Cloudinary variables are configured in `backend/.env` and restart the backend after changing them. Also check the 10 MB multipart/file-size limit enforced by the API and the 20 MB request limit configured by Nginx.
