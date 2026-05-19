# API reference

Base URL — `http://localhost:4000/api` (local) or `<host>/api` when behind the nginx proxy.

All requests and responses are JSON. Authenticated endpoints require an `Authorization: Bearer <jwt>` header.

## Conventions

- **Success envelope**: `{ "data": ..., "meta": ... }`. `meta` only on paginated endpoints.
- **Error envelope**: `{ "error": { "code": "<CODE>", "message": "<human-readable>", "details": <optional> } }`.
- **Error codes**: `BAD_REQUEST` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `VALIDATION_ERROR` (422), `RATE_LIMITED` (429), `INTERNAL` (500).
- **Pagination meta**: `{ "total": N, "page": P, "limit": 10, "totalPages": T }`. `limit` is fixed at 10.

Source of truth for every request shape: Zod schemas in [`Backend/src/schemas/`](../Backend/src/schemas/).

---

## `GET /api/health`

Liveness probe. Public.

```bash
curl http://localhost:4000/api/health
```

```json
{ "status": "ok", "service": "leadsrack-api", "uptime": 12.34 }
```

---

## `POST /api/auth/register`

Create a new user. Public. Rate-limited (20 req / 15 min / IP).

Schema: [`registerSchema`](../Backend/src/schemas/auth.ts).

**Request**

```json
{ "name": "Aaditya Gunjal", "email": "you@example.com", "password": "at-least-8-chars", "role": "sales" }
```

`role` is optional and defaults to `sales`. Allowed: `"admin" | "sales"`.

**Response 201**

```json
{
  "data": {
    "user": { "id": "65...", "name": "Aaditya Gunjal", "email": "you@example.com", "role": "sales", "createdAt": "...", "updatedAt": "..." },
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
{ "data": { "user": { "id": "...", "name": "...", "email": "...", "role": "sales", "createdAt": "...", "updatedAt": "..." } } }
```

**Errors**: `401 UNAUTHORIZED`.

---

## `GET /api/leads`

List leads visible to the caller. Bearer required.

- Admin sees all leads.
- Sales sees only leads where `createdBy === user.id`.

**Query parameters** (all optional). Schema: [`listLeadsQuerySchema`](../Backend/src/schemas/lead.ts).

| Param | Type | Notes |
| --- | --- | --- |
| `status` | `New \| Contacted \| Qualified \| Lost` | Exact match |
| `source` | `Website \| Instagram \| Referral` | Exact match |
| `search` | `string` (1–100 chars) | Case-insensitive partial match against `name` OR `email` |
| `sort` | `latest \| oldest` | Default `latest` (`createdAt` desc) |
| `page` | `integer >= 1` | Default 1; `limit` is fixed at 10 |

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

Stream filtered leads as CSV. Bearer required. Accepts the same query parameters as `GET /api/leads`. Same RBAC scope (sales sees own; admin sees all).

Response headers:

```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="leads-<timestamp>.csv"
```

Columns: `name, email, status, source, createdAt, updatedAt`.

```bash
curl "http://localhost:4000/api/leads/export.csv?status=Qualified&source=Instagram" \
  -H "Authorization: Bearer $JWT" \
  -o leads.csv
```

The implementation uses `mongoose.find().lean().cursor()` piped through `@json2csv/node` `Transform` into the response — memory-flat regardless of result-set size.
