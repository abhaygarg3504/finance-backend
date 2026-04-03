# Finance Data Processing & Access Control Backend

A production-grade REST API built with **Node.js + Express + TypeScript + Prisma + PostgreSQL**.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript (strict mode) |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Validation | Joi |
| Logging | Winston + Morgan |
| Security | Helmet, CORS, Rate Limiting |

---

## Architecture

```
src/
├── controllers/      # HTTP layer — parse req, call service, send response
├── services/         # Business logic — all domain rules live here
├── routes/           # Route definitions + middleware chaining
├── middlewares/      # auth, role guard, validation, error handler, rate limiter
├── validators/       # Joi schemas for all endpoints
├── prisma/           # Prisma client singleton
├── utils/            # ApiError, ApiResponse, asyncHandler, logger, pagination
├── types/            # Shared TypeScript interfaces
└── app.ts            # Express bootstrap + server start
```

**Request flow:**
```
Request → Rate Limiter → authenticate → allowRoles → validate → Controller → Service → Prisma → Response
                                                                                       ↓
                                                                               errorHandler (on throw)
```

---

## Roles & Permissions

| Action | VIEWER | ANALYST | ADMIN |
|---|:---:|:---:|:---:|
| Login / Register | ✅ | ✅ | ✅ |
| View own records | ✅ | ✅ | ✅ |
| View ALL records | ❌ | ✅ | ✅ |
| View dashboard summary | ✅ (own) | ✅ (all) | ✅ (all) |
| Create records | ❌ | ❌ | ✅ |
| Update records | ❌ | ❌ | ✅ |
| Delete records (soft) | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## Setup

### 1. Clone & install
```bash
git clone <repo-url>
cd finance-backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials and JWT secret
```

### 3. Run database migrations
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Seed demo data
```bash
npm run prisma:seed
```

### 5. Start dev server
```bash
npm run dev
```

Server runs at `http://localhost:5000`

---

## API Reference

### Auth  `POST /api/auth/...`

#### Register
```
POST /api/auth/register
Body: { name, email, password, role? }
Response: { user, token }
```

#### Login
```
POST /api/auth/login
Body: { email, password }
Response: { user, token }
```

#### Get Profile
```
GET /api/auth/me
Auth: Bearer <token>
```

---

### Records  `GET|POST|PATCH|DELETE /api/records/...`

All record routes require `Authorization: Bearer <token>`

#### Create Record (ADMIN only)
```
POST /api/records
Body: { amount, type, category, date, note? }
```

#### List Records (with filtering + pagination)
```
GET /api/records
Query params:
  page        = 1         (default)
  limit       = 10        (max 100)
  type        = INCOME | EXPENSE
  category    = food
  startDate   = 2024-01-01
  endDate     = 2024-03-31
  search      = keyword   (searches note + category)
  sortBy      = date | amount | category | createdAt
  sortOrder   = asc | desc

Example:
  GET /api/records?type=EXPENSE&category=food&startDate=2024-01-01&page=2&limit=5
```

#### Get Single Record
```
GET /api/records/:id
```

#### Update Record (ADMIN only)
```
PATCH /api/records/:id
Body: { amount?, type?, category?, date?, note? }
```

#### Delete Record — soft delete (ADMIN only)
```
DELETE /api/records/:id
```

---

### Dashboard  `GET /api/dashboard/...`

All routes require auth. VIEWERs see their own data; ANALYST/ADMIN see global data.

#### Summary
```
GET /api/dashboard/summary
Response: { totalIncome, totalExpense, netBalance, totalRecords, recentActivity }
```

#### Category Breakdown
```
GET /api/dashboard/categories
Response: [{ category, type, total, count }]
```

#### Monthly Trends
```
GET /api/dashboard/trends/monthly?months=6
Response: [{ month, income, expense, net }]
```

#### Weekly Trends
```
GET /api/dashboard/trends/weekly
Response: [{ week, income, expense, net }]
```

---

### Users  `GET|PATCH|DELETE /api/users/...`  (ADMIN only)

#### List Users
```
GET /api/users?page=1&limit=10&role=ANALYST&isActive=true
```

#### Get User
```
GET /api/users/:id
```

#### Update User (role, status)
```
PATCH /api/users/:id
Body: { name?, role?, isActive? }
```

#### Delete User
```
DELETE /api/users/:id
```

#### Change Own Password
```
PUT /api/users/password/change
Body: { currentPassword, newPassword }
```

---

## Error Response Format

All errors follow a consistent shape:
```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

Common status codes:
- `400` Bad Request — validation failure
- `401` Unauthorized — missing or invalid JWT
- `403` Forbidden — insufficient role
- `404` Not Found — resource doesn't exist
- `409` Conflict — duplicate email
- `429` Too Many Requests — rate limit exceeded
- `500` Internal Server Error

---

## Seed Credentials

| Role | Email | Password |
|---|---|---|
| ADMIN | admin@finance.com | Admin@1234 |
| ANALYST | analyst@finance.com | Analyst@1234 |
| VIEWER | viewer@finance.com | Viewer@1234 |

---

## Key Design Decisions

### 1. Layered Architecture (routes → controllers → services → prisma)
Controllers handle only HTTP concerns. All business rules, access scoping, and data logic live in the service layer. This makes services independently testable.

### 2. Soft Delete
Records are never hard-deleted. `isDeleted: true` preserves audit history and supports potential restore functionality.

### 3. Role-Scoped Data Access
Enforced at the **service layer**, not just at the route level. A VIEWER calling `getRecords` always gets only their own records even if the route guard is bypassed — defense in depth.

### 4. Consistent API Responses
`ApiResponse` utility standardises all success responses. `ApiError` standardises all error responses. Every endpoint looks the same to the frontend.

### 5. asyncHandler Wrapper
Eliminates try/catch boilerplate in every controller. All async errors are automatically forwarded to the central `errorHandler` middleware.

### 6. Prisma Error Mapping
The error handler catches Prisma-specific error codes (P2002 unique constraint, P2025 not found) and maps them to clean HTTP responses.

### 7. Pagination Capped at 100
Prevents accidental over-fetching. Offset-based pagination chosen for simplicity; cursor-based is preferred at scale.

---

## Assumptions

- One user can have many records (ownership tracked via `userId`)
- Financial amounts are stored as `Float` (for production, `Decimal` is safer for currency)
- JWT tokens are stateless; logout is client-side (token blacklisting not implemented)
- `ADMIN` can create records on behalf of any user (record is attributed to the requesting admin)
