# Architecture

How Leadsrack is wired together. Reading order: system context → request pipeline → primary-workflow sequence → data model → known limitations.

## System context

```mermaid
flowchart LR
  user((User))
  user -->|HTTPS, bearer JWT| web[Frontend<br/>React + Vite, served by nginx]
  web -->|JSON over HTTP /api/*| api[Backend<br/>Express 5 + TypeScript]
  api -->|Mongoose driver| db[(MongoDB 7)]
  api -.->|reads/writes| logs[(pino structured logs<br/>stdout)]
  api -->|signs / verifies| jwt[[JWT HS256 + JWT_SECRET]]
```

Three runtime services in compose: `web`, `api`, `mongo`. Frontend talks to backend only through `/api/*` — in production that path is proxied by nginx; in local dev the client hits the API origin directly via `VITE_API_URL`.

## Request pipeline (API)

```mermaid
flowchart TB
  req([Incoming request])
  req --> helmet[helmet headers]
  helmet --> cors[CORS allowlist]
  cors --> body[express.json 100kb limit]
  body --> http[pino-http access log]
  http --> route{Route match?}
  route -- no --> nf[notFound 404]
  route -- yes --> rate[rate limiter<br/>auth or write only]
  rate --> auth[requireAuth<br/>JWT verify → req.user]
  auth --> role[requireRole<br/>optional layer]
  role --> validate[validate<br/>Zod schemas]
  validate --> ctrl[Controller]
  ctrl --> svc[Service]
  svc --> mongo[(Mongoose / Mongo)]
  svc --> ctrl
  ctrl --> res([JSON envelope])
  ctrl -.->|throws AppError or unknown| err[errorHandler<br/>mounted last]
  err --> res
  nf --> err
```

Mounting order is enforced in [`Backend/src/app.ts`](Backend/src/app.ts):

```
helmet → cors → json → pino-http → /api router → notFound → errorHandler
```

`errorHandler` is last so any `next(err)` flows through it. `AppError` maps to a structured `{ error: { code, message, details? } }` envelope; unknown errors get a generic 500.

## Primary workflow — Sales user creates and filters leads

```mermaid
sequenceDiagram
  autonumber
  actor S as Sales user
  participant UI as React + React Query
  participant AX as axios + JWT interceptor
  participant API as Express
  participant SVC as leads service
  participant DB as MongoDB

  S->>UI: Submit register or login form
  UI->>AX: POST /auth/register | /auth/login
  AX->>API: HTTP + JSON body
  API->>SVC: registerUser / loginUser (bcrypt + sign)
  SVC->>DB: User.findOne / create
  DB-->>SVC: doc
  SVC-->>API: { user, token }
  API-->>UI: 201 / 200 envelope
  UI->>UI: authStore.setSession(token, user)<br/>persist token to localStorage

  S->>UI: Open /leads, type 'Rahul' in search
  Note over UI: useDebounce(value, 400ms)
  UI->>AX: GET /leads?search=Rahul&status=Qualified&page=1
  AX->>API: Authorization: Bearer <jwt>
  API->>API: validate(listLeadsQuerySchema)<br/>requireAuth (decode → req.user)
  API->>SVC: listLeads(query, viewer)
  SVC->>SVC: build filter incrementally<br/>(viewer.role !== 'admin' ⇒ filter.createdBy = viewer.id)
  SVC->>DB: countDocuments + find().sort().skip().limit(10)
  DB-->>SVC: docs + total
  SVC-->>API: { data, meta }
  API-->>UI: 200 envelope
  UI->>UI: React Query caches by queryKey = ['leads','list', query]

  S->>UI: Click "Export CSV"
  UI->>AX: fetch /leads/export.csv?same-filters (bearer in headers)
  AX->>API: GET
  API->>SVC: streamFilteredLeads(query, viewer).lean().cursor()
  SVC->>DB: find().sort().lean().cursor()
  DB-->>SVC: object-mode stream
  SVC-->>API: pipeline(cursor, json2csv Transform, res)
  API-->>UI: text/csv stream
  UI->>UI: blob → object URL → <a download>
```

Every authenticated request shares the same middleware order: `requireAuth` first, then any `requireRole(...)` layer, then `validate({ body, query, params })`, then controller. Errors bubble to a single `errorHandler` at the end of the chain.

## Data model

```mermaid
erDiagram
  USER ||--o{ LEAD : "createdBy"

  USER {
    ObjectId _id PK
    string   name
    string   email "unique, lowercase"
    string   passwordHash "select: false"
    string   role "admin | sales"
    date     createdAt
    date     updatedAt
  }

  LEAD {
    ObjectId _id PK
    string   name
    string   email "lowercase"
    string   status "New | Contacted | Qualified | Lost"
    string   source "Website | Instagram | Referral"
    ObjectId createdBy FK "ref: User"
    date     createdAt
    date     updatedAt
  }
```

Indexes:

- `User.email` — unique.
- `Lead.createdBy` — single-field (filter for sales users).
- `Lead.status` and `Lead.source` — single-field (frequent filters).
- `Lead.{createdBy:1, createdAt:-1}` — compound (covers the sales-user list query pattern).
- `Lead.{name:'text', email:'text'}` — text index (kept for future full-text upgrade; current search uses escaped regex for partial matches).

## Known limitations

- **Type drift** between Backend Zod schemas (the source of truth) and Frontend interfaces (`Frontend/src/types/api.ts`). Mitigated by the small entity count (2) and CI lint+typecheck on both sides. Future improvement: introduce `packages/shared` — see [ADR 0001](docs/ADRs/0001-no-monorepo-tooling.md).
- **Token in localStorage** is XSS-exposed. Trade-off documented in [ADR 0005](docs/ADRs/0005-token-in-localstorage.md); CSP and httpOnly-cookie migration in the roadmap.
- **No refresh tokens**. The access token simply expires after `JWT_EXPIRES_IN`; the user is forced to log in again.
- **CSV export memory** scales linearly with the export size. Streaming via `pipeline(cursor, json2csv, res)` keeps memory flat; however, very wide filter sets on admin accounts hit the database hard. Mitigation: future improvement is to gate exports beyond N rows with a job queue.
- **No tests**. Smoke-only via `pnpm build` in CI. Adding Vitest is in the roadmap and would slot into both workspaces without restructuring.
- **No observability** (Sentry/OTel). Logs are stdout-only.
- **Dark mode** applies to the auth and leads pages; the dashboard page is brand-themed dark in both modes.

## Evolution paths

- Add `packages/shared/` (Zod schemas + inferred types + API path constants) and migrate both apps to consume it. This eliminates the manual type mirror and the drift risk.
- Replace localStorage JWT with httpOnly refresh-token cookies + short-lived access JWT in memory. Add CSRF token for cookie-based auth.
- Introduce a job queue (BullMQ + Redis) for the CSV export to remove the synchronous response constraint.
- Add Sentry + OpenTelemetry hooks at the error handler and the pino logger.
