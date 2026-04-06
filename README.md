# Zorvyn Finance Data Processing & Access Control API

A production-ready Node.js backend providing financial record management, robust role-based access control (RBAC), and fast aggregations, designed for the Zorvyn FinTech Assessment.

## 🚀 Prerequisites
- Node.js (v18+)
- PostgreSQL Database Instance (Powered by **Neon**)
- Prisma CLI installed globally or via npx (`npm install -g prisma`)
- Git

## ⚙️ Project Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/varshithreddy7/Zorvyn-Assignment.git
   cd Zorvyn-Assignment
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Copy the example template and fill in your Neon PostgreSQL strings and a secure JWT secret:
   ```bash
   cp .env.example .env
   ```

4. **Initialize the Database:**
   Push the schema to Neon and generate the Prisma Client:
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Seed the Database:**
   Populate the tables with idempotent base roles (Admin/Analyst/Viewer) and 8 demo records safely:
   ```bash
   npm run db:seed
   ```

6. **Start the API Server:**
   ```bash
   npm run dev
   ```

---

## 🔑 Demo Credentials (from Seed)
| Role    | Email                | Password      |
| :---    | :---                 | :---          |
| Admin   | `admin@zorvyn.com`     | `password123` |
| Analyst | `analyst@zorvyn.com`   | `password123` |
| Viewer  | `viewer@zorvyn.com`    | `password123` |

---

## 🛡️ Role Permission Matrix
| Action                           | Viewer | Analyst | Admin |
| :---                             | :---:  | :---:   | :---: |
| **Authenticate / Login**         |   ✅   |   ✅    |   ✅  |
| **View Financial Records**       |   ✅   |   ✅    |   ✅  |
| **View Dashboard Analytics**     |   ❌   |   ✅    |   ✅  |
| **Create Financial Records**     |   ❌   |   ✅    |   ✅  |
| **Edit/Update Records**          |   ❌   |   ✅    |   ✅  |
| **Delete Records (Soft Delete)** |   ❌   |   ❌    |   ✅  |
| **Manage Users & Roles**         |   ❌   |   ❌    |   ✅  |

---

## 📡 API Endpoints

### Authentication
| Method | Route                   | Auth Required | Min Role | Description |
| :---   | :---                    | :---:         | :---:    | :---        |
| POST   | `/api/v1/auth/register` | No            | None     | Register a new user |
| POST   | `/api/v1/auth/login`    | No            | None     | Authenticate and receive JWT |

### Dashboard Analytics
| Method | Route                   | Auth Required | Min Role | Description |
| :---   | :---                    | :---:         | :---:    | :---        |
| GET    | `/api/v1/dashboard/summary` | Yes | Analyst | Computes aggregate totals, monthly trends via SQL, and activity feed |

### Financial Records
| Method | Route                   | Auth Required | Min Role | Description |
| :---   | :---                    | :---:         | :---:    | :---        |
| GET    | `/api/v1/records`       | Yes           | Viewer   | Retrieve paginated & filtered records |
| GET    | `/api/v1/records/:id`   | Yes           | Viewer   | Retrieve single record |
| POST   | `/api/v1/records`       | Yes           | Analyst  | Create new financial record |
| PATCH  | `/api/v1/records/:id`   | Yes           | Analyst  | Update record details |
| DELETE | `/api/v1/records/:id`   | Yes           | Admin    | Soft delete a record |

### User Management
| Method | Route                      | Auth Required | Min Role | Description |
| :---   | :---                       | :---:         | :---:    | :---        |
| GET    | `/api/v1/users`            | Yes           | Admin    | List all users |
| GET    | `/api/v1/users/:id`        | Yes           | Admin    | Retrieve user details |
| PATCH  | `/api/v1/users/:id/role`   | Yes           | Admin    | Modify user authorization tier |
| PATCH  | `/api/v1/users/:id/status` | Yes           | Admin    | Deactivate user (blocks login) |

---

## 🏗️ Design Decisions & Architecture

1. **3-Tier Service Architecture:** Controllers are purposely kept "thin", doing nothing but executing parameter validation and response routing. All raw business logic and Prisma calls are strictly locked inside `src/services/` to enforce Enterprise separation of concerns and testability.
2. **Soft Deletion Protocol:** Invoking `DELETE /records/:id` does not permanently drop data rows. It natively populates a `deletedAt` timestamp. This preserves the financial integrity of historical computations while hiding the record from all active queries (`where: { deletedAt: null }`).
3. **Dashboard `$queryRaw` Aggregation:** Native Prisma `.groupBy` is insufficient for zero-state edge cases without mapping loops in JS. Utilizing `prisma.$queryRaw` allows the injection of `COALESCE` casting `::float` directly at the Neon DB layer. If 0 records exist, PostgreSQL returns `0.00` cleanly avoiding JSON parsing breaks. It also efficiently runs `TO_CHAR(date, 'YYYY-MM')` grouping for precise trend tracking.
4. **ROLE_LEVEL Numeric Comparison:** The authorization middleware compares roles mapped to integers (`viewer=1, analyst=2, admin=3`). Doing basic mathematical minimum evaluations guarantees scalable hierarchy overrides natively.
5. **Idempotent Upsert Seeding:** The `seed.js` script replaces destructive `deleteMany` schemas with explicit `.upsert()`. This ensures that a pipeline or CI action can invoke the database seeding indefinitely without accidentally dropping vital production records.
