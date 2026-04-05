# Finance Data Processing and Access Control Backend

A robust, role-based backend API for a finance dashboard built as part of the Zorvyn Engineering challenge.

## 🚀 Tech Stack

- **Framework:** Node.js + Express
- **Database:** PostgreSQL (Neon Serverless)
- **ORM:** Prisma Client v7
- **Security:** JWT Authentication, bcryptjs, express-rate-limit
- **Validation:** express-validator

## 🔒 Role-Based Access Control (RBAC)

The system enforces strict access bounds:
1. **Admin:** Full access. Can create, read, update, and soft-delete financial records. Can fetch complete user lists and update user access levels.
2. **Analyst:** Medium access. Can view lists of financial records and full dashboard analytics insights. Cannot modify any records.
3. **Viewer:** Limited access. Can only view the aggregated dashboard metrics API. Cannot view granular tables of individual records.

## 📦 Key Engineering Decisions

- **Soft Deletion:** Implemented `deletedAt` logic in the schema. When an admin deletes a financial record, it isn't physically dropped from the database but simply flagged. This preserves historical integrity and data audits. Analytics queries natively filter out soft-deleted items.
- **Database-Level Aggregation:** The `/api/v1/dashboard/summary` endpoint utilizes native SQL aggregation (`groupBy`, `_sum` via Prisma) to let the Database compute metric totals rather than fetching bulky Javascript Arrays into Express.
- **Unified API Contract:** Added custom response handlers in `src/utils/response.js` ensures every successful request and every error (including uncaught server issues and 422 validation errors) follows an identical, predictable JSON shape for front-end ingestion.
- **Pagination & Filtering:** The `/api/v1/records` endpoint supports robust scaling via structured pagination (`page`, `limit`) and explicit type and category timeframe bounds.

## 🛠️ Setup Instructions

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and fill in your connection variables (a live Neon DB works best).
```bash
cp .env.example .env
```
*(Ensure you set `JWT_SECRET` to a strong random string).*

### 3. Database Schema Push
Sync the Prisma schema to your PostgreSQL database:
```bash
npx prisma db push
```

### 4. Database Seeding (Demo Data)
Quickly populate the database with an Admin, an Analyst, a Viewer, and realistic dummy financial metrics to test the dashboard immediately:
```bash
npm run db:seed
```

### 5. Running the Application
Start the development server with live-reloading:
```bash
npm run dev
```

## 📡 API Endpoints Overview (v1)

### Authentication
- `POST /api/v1/auth/register` - Create a new account
- `POST /api/v1/auth/login` - Authenticate and receive JWT

### User Management (Admin Only)
- `GET /api/v1/users` - List all users
- `GET /api/v1/users/:id` - Get specific user
- `PUT /api/v1/users/:id/role` - Upgrade/Downgrade user permission
- `PUT /api/v1/users/:id/status` - Activate/Deactivate user access

### Financial Records (Admin & Analyst)
- `GET /api/v1/records` - View paginated and filtered historical records
- `GET /api/v1/records/:id` - View a specific single entry
- `POST /api/v1/records` - (Admin only) Log a new income/expense
- `PUT /api/v1/records/:id` - (Admin only) Modify an entry
- `DELETE /api/v1/records/:id` - (Admin only) Soft-delete an entry

### Dashboard Metrics
- `GET /api/v1/dashboard/summary` - Aggregated total metrics, category breakdowns, and latest activity feed.
