# API reference

Base URL — `http://localhost:4000/api` (local), `<render-url>/api` (production), or `<host>/api` when behind the nginx proxy.

All requests and responses are JSON. Authenticated endpoints require an `Authorization: Bearer <jwt>` header.

## Conventions

- **Success envelope**: `{ "data": ..., "meta": ... }`. `meta` only on paginated endpoints.
- **Error envelope**: `{ "error": { "code": "<CODE>", "message": "<human-readable>", "details": <optional> } }`.
- **Error codes**: `BAD_REQUEST` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `VALIDATION_ERROR` (422), `RATE_LIMITED` (429), `INTERNAL` (500).
- **Pagination meta**: `{ "total": N, "page": P, "limit": 10, "totalPages": T }`. `limit` is fixed at 10.

Source of truth for every request shape: Zod schemas in [`Backend/src/schemas/`](../Backend/src/schemas/).

## Endpoint index

| Method   | Path                  | Auth                 | Section                                |
| -------- | --------------------- | -------------------- | -------------------------------------- |
| `GET`    | `/health`             | Public               | [Health](#get-apihealth)               |
| `POST`   | `/auth/register`      | Public               | [Auth](#post-apiauthregister)          |
| `POST`   | `/auth/login`         | Public               | [Auth](#post-apiauthlogin)             |
| `GET`    | `/auth/me`            | Bearer               | [Auth](#get-apiauthme)                 |
| `GET`    | `/leads`              | Bearer               | [Leads](#get-apileads)                 |
| `POST`   | `/leads`              | Bearer               | [Leads](#post-apileads)                |
| `GET`    | `/leads/:id`          | Bearer (owner/admin) | [Leads](#get-apileadsid)               |
| `PATCH`  | `/leads/:id`          | Bearer (owner/admin) | [Leads](#patch-apileadsid)             |
| `DELETE` | `/leads/:id`          | Bearer (owner/admin) | [Leads](#delete-apileadsid)            |
| `GET`    | `/leads/export.csv`   | Bearer               | [Leads](#get-apileadsexportcsv)        |
| `GET`    | `/team`               | Bearer + admin       | [Team](#get-apiteam)                   |
| `GET`    | `/dashboard/overview` | Bearer               | [Dashboard](#get-apidashboardoverview) |
| `GET`    | `/activities`         | Bearer               | [Activities](#get-apiactivities)       |
| `GET`    | `/contacts`           | Bearer               | [Contacts](#get-apicontacts)           |
| `GET`    | `/notifications`      | Bearer               | [Notifications](#get-apinotifications) |

---

## `GET /api/health`

DB-aware liveness probe. Public.

```bash
curl http://localhost:4000/api/health
```

**Response 200** (Mongo connected):

```json
{ "status": "ok", "service": "leadsrack-api", "uptime": 12.34, "db": "connected" }
```

**Response 503** (Mongo disconnected):

```json
{ "status": "degraded", "service": "leadsrack-api", "uptime": 0.7, "db": "disconnected" }
```

Render uses this as the readiness check (see `healthCheckPath: /api/health` in `render.yaml`).

---

## `POST /api/auth/register`

Create a new user. Public. Rate-limited (20 req / 15 min / IP).

Schema: [`registerSchema`](../Backend/src/schemas/auth.ts).

**Request**

```json
{
  "name": "Aaditya Gunjal",
  "email": "you@example.com",
  "password": "at-least-8-chars",
  "role": "sales"
}
```

`role` is optional and defaults to `sales`. Allowed: `"admin" | "sales"`.

**Response 201**

```json
{
  "data": {
    "user": {
      "id": "65...",
      "name": "Aaditya Gunjal",
      "email": "you@example.com",
      "role": "sales",
      "createdAt": "...",
      "updatedAt": "..."
    },
    "token": "eyJhbGciOi..."
  }
}
```

**Errors**

- `422 VALIDATION_ERROR` — bad input shape.
- `409 CONFLICT` — email already registered.
- `429 RATE_LIMITED` — too many attempts.

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Aaditya","email":"a@example.com","password":"hunter2hunter2"}'
```

---

## `POST /api/auth/login`

Exchange credentials for a JWT. Public. Rate-limited (20 req / 15 min / IP).

Schema: [`loginSchema`](../Backend/src/schemas/auth.ts).

**Request**

```json
{ "email": "you@example.com", "password": "your-password" }
```

**Response 200** — same shape as register.

**Errors**

- `401 UNAUTHORIZED` — `{ "error": { "code": "UNAUTHORIZED", "message": "Invalid credentials" } }` (intentionally vague — does not distinguish unknown email vs wrong password).
- `422 VALIDATION_ERROR`.

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"sales@leadsrack.local","password":"sales123!"}'
```

---

## `GET /api/auth/me`

Current user. Bearer required.

```bash
curl http://localhost:4000/api/auth/me -H "Authorization: Bearer $JWT"
```

```json
{
  "data": {
    "user": {
      "id": "...",
      "name": "...",
      "email": "...",
      "role": "sales",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

**Errors**: `401 UNAUTHORIZED`.

---

## `GET /api/leads`

List leads visible to the caller. Bearer required.

- Admin sees all leads (and can filter by `?owner=`).
- Sales sees only leads where `createdBy === user.id`. `?owner=` is silently ignored for sales.

**Query parameters** (all optional). Schema: [`listLeadsQuerySchema`](../Backend/src/schemas/lead.ts).

| Param    | Type                                    | Notes                                                    |
| -------- | --------------------------------------- | -------------------------------------------------------- |
| `status` | `New \| Contacted \| Qualified \| Lost` | Exact match                                              |
| `source` | `Website \| Instagram \| Referral`      | Exact match                                              |
| `search` | `string` (1–100 chars)                  | Case-insensitive partial match against `name` OR `email` |
| `sort`   | `latest \| oldest`                      | Default `latest` (`createdAt` desc)                      |
| `page`   | `integer >= 1`                          | Default 1; `limit` is fixed at 10                        |
| `owner`  | `email` (admin only)                    | Resolve to `createdBy = User.findOne({ email })._id`     |

Filters compose (logical AND). Example: `?status=Qualified&source=Instagram&search=Rahul&sort=latest&page=1`.

**Response 200**

```json
{
  "data": [
    {
      "id": "65...",
      "name": "Rahul Sharma",
      "email": "rahul.sharma@example.com",
      "status": "Qualified",
      "source": "Instagram",
      "createdBy": "65...",
      "createdAt": "2026-05-19T10:00:00.000Z",
      "updatedAt": "2026-05-19T10:00:00.000Z"
    }
  ],
  "meta": { "total": 42, "page": 1, "limit": 10, "totalPages": 5 }
}
```

```bash
curl "http://localhost:4000/api/leads?status=Qualified&source=Instagram&search=Rahul&sort=latest&page=1" \
  -H "Authorization: Bearer $JWT"
```

---

## `POST /api/leads`

Create a lead. Bearer required. Write-rate-limited (60 req / min / IP).

Schema: [`createLeadSchema`](../Backend/src/schemas/lead.ts).

**Request**

```json
{ "name": "Priya Mehta", "email": "priya@example.com", "status": "New", "source": "Website" }
```

`status` is optional and defaults to `"New"`. The `createdBy` field is set automatically to the authenticated user.

**Response 201** — `{ "data": <Lead> }`.

**Errors**: `422 VALIDATION_ERROR`, `401`.

```bash
curl -X POST http://localhost:4000/api/leads \
  -H "Authorization: Bearer $JWT" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Priya Mehta","email":"priya@example.com","source":"Website"}'
```

---

## `GET /api/leads/:id`

Read one lead. Bearer required. Owner-or-admin.

- `:id` must be a 24-char hex Mongo ObjectId.

**Response 200** — `{ "data": <Lead> }`.

**Errors**: `404 NOT_FOUND`, `403 FORBIDDEN` (sales user requesting another user's lead).

---

## `PATCH /api/leads/:id`

Partial update. Bearer required. Owner-or-admin. Write-rate-limited.

Schema: [`updateLeadSchema`](../Backend/src/schemas/lead.ts). At least one field must be provided. Editable: `name`, `email`, `status`, `source`.

**Response 200** — `{ "data": <Lead> }`.

```bash
curl -X PATCH "http://localhost:4000/api/leads/$LEAD_ID" \
  -H "Authorization: Bearer $JWT" \
  -H 'Content-Type: application/json' \
  -d '{"status":"Qualified"}'
```

---

## `DELETE /api/leads/:id`

Owner-or-admin. Write-rate-limited.

**Response 204** — empty body.

```bash
curl -X DELETE "http://localhost:4000/api/leads/$LEAD_ID" -H "Authorization: Bearer $JWT"
```

---

## `GET /api/leads/export.csv`

Export filtered leads as CSV. Bearer required. Accepts the same query parameters as `GET /api/leads`. Same RBAC scope (sales sees own; admin sees all; admin can use `?owner=`).

Response headers:

```text
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="leads-<timestamp>.csv"
```

Columns: `name, email, status, source, createdAt, updatedAt`.

```bash
curl "http://localhost:4000/api/leads/export.csv?status=Qualified&source=Instagram" \
  -H "Authorization: Bearer $JWT" \
  -o leads.csv
```

The implementation uses `Lead.find().lean()` piped through `@json2csv/node` AsyncParser. For the current pagination-capped scale (a few thousand rows max in practice), in-memory serialization is simpler and more reliable than a cursor stream.

---

## `GET /api/team`

Admin-only. Returns the sales team with per-user lead aggregates plus a summary block.

```bash
curl http://localhost:4000/api/team -H "Authorization: Bearer $ADMIN_JWT"
```

**Response 200**

```json
{
  "data": {
    "summary": {
      "totalMembers": 3,
      "adminCount": 1,
      "salesCount": 2,
      "totalLeads": 25,
      "topPerformer": {
        "id": "65...",
        "name": "Sales User",
        "email": "sales@leadsrack.local",
        "totalLeads": 12
      }
    },
    "members": [
      {
        "id": "65...",
        "name": "Sales User",
        "email": "sales@leadsrack.local",
        "role": "sales",
        "avatar": "https://i.pravatar.cc/150?u=sales%40leadsrack.local",
        "leadCounts": {
          "total": 12,
          "byStatus": { "New": 3, "Contacted": 4, "Qualified": 3, "Lost": 2 }
        }
      }
    ]
  }
}
```

**Errors**: `401 UNAUTHORIZED`, `403 FORBIDDEN` (sales role).

Implementation: `User.find()` joined with `Lead.aggregate($group)` by `createdBy` and `$cond` per status. Sorted by `total` descending; `topPerformer` is null when no leads exist.

---

## `GET /api/dashboard/overview`

Single round-trip read returning every dashboard widget's data. Bearer required.

```bash
curl http://localhost:4000/api/dashboard/overview -H "Authorization: Bearer $JWT"
```

**Response 200** (abridged)

```json
{
  "data": {
    "kpis": [
      {
        "key": "views",
        "title": "Views",
        "value": "721K",
        "change": "+11.01%",
        "positive": true,
        "bgKey": "views"
      },
      {
        "key": "visits",
        "title": "Visits",
        "value": "367K",
        "change": "-0.03%",
        "positive": false,
        "bgKey": "visits"
      }
    ],
    "userChart": {
      "xAxis": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      "series": [
        {
          "name": "Current Week",
          "data": [12, 18, 14, 22, 16, 24, 20],
          "color": "#C6C7F8",
          "dashed": false
        },
        {
          "name": "Previous Week",
          "data": [8, 12, 10, 15, 12, 18, 14],
          "color": "#A8C5DA",
          "dashed": true
        }
      ]
    },
    "trafficByWebsite": [{ "name": "Google", "value": 80, "active": false }],
    "trafficByDevice": [{ "label": "Linux", "value": 40, "color": "indigo" }],
    "trafficByLocation": [{ "country": "United States", "percentage": 38.6, "color": "purple" }],
    "marketingMonthly": [{ "month": "Jan", "value": 40, "color": "indigo" }]
  }
}
```

Data is read from the `dashboardkpis`, `chartseries`, and `trafficaggregates` collections (all populated by `pnpm seed`). The endpoint fans three reads in parallel via `Promise.all`.

**Errors**: `401 UNAUTHORIZED`.

---

## `GET /api/activities`

Recent activity feed. Bearer required. Returns the 20 most recent activities populating actor name/email/role.

```bash
curl http://localhost:4000/api/activities -H "Authorization: Bearer $JWT"
```

**Response 200**

```json
{
  "data": [
    {
      "id": "65...",
      "actorName": "Admin User",
      "actorEmail": "admin@leadsrack.local",
      "actorRole": "admin",
      "action": "Released filter improvements to all users.",
      "createdAt": "2026-05-19T14:30:00.000Z"
    }
  ]
}
```

Powered by `Activity.find().populate('actor', 'name email role').sort({ createdAt: -1 }).limit(20)`.

---

## `GET /api/contacts`

Contacts list. Bearer required. Alphabetical by `name`.

```bash
curl http://localhost:4000/api/contacts -H "Authorization: Bearer $JWT"
```

**Response 200**

```json
{
  "data": [
    {
      "id": "65...",
      "name": "Sales User",
      "email": "sales@leadsrack.local",
      "avatar": "https://i.pravatar.cc/150?u=sales",
      "linkedUserRole": "sales"
    },
    {
      "id": "65...",
      "name": "Natali Craig",
      "email": "natali.craig@example.com",
      "avatar": "https://i.pravatar.cc/150?u=natali",
      "linkedUserRole": null
    }
  ]
}
```

`linkedUserRole` is `null` for external contacts (no linked system user). `email` falls back to the linked user's email when the contact entry doesn't have one of its own.

---

## `GET /api/notifications`

Role-scoped notifications. Bearer required.

- Admin: sees all audiences (`admin | sales | all`).
- Sales: sees `sales` + `all` (no admin-only entries).

```bash
curl http://localhost:4000/api/notifications -H "Authorization: Bearer $JWT"
```

**Response 200**

```json
{
  "data": [
    {
      "id": "65...",
      "kind": "bug",
      "message": "Lead duplication detected on import.",
      "audience": "admin",
      "createdAt": "2026-05-19T14:28:00.000Z"
    },
    {
      "id": "65...",
      "kind": "lead-status",
      "message": "3 leads moved to Qualified this morning.",
      "audience": "all",
      "createdAt": "2026-05-19T11:30:00.000Z"
    }
  ]
}
```

Sorted by `createdAt` descending. The `kind` field maps to an icon + color in the right-drawer UI (`bug`, `user`, `lead-status`, `subscribe`; unknown kinds get a fallback).
