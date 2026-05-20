# Architecture

How Leadsrack is wired together. Reading order: system context → request pipeline → primary-workflow sequence → data model → known limitations.

## System context

```mermaid
flowchart LR
  user((User))
  user -->|HTTPS, bearer JWT| web[Frontend<br/>React + Vite, Vercel or nginx]
  web -->|JSON over /api/*| api[Backend<br/>Express 5 + TypeScript, Render]
  api -->|Mongoose driver| db[(MongoDB Atlas)]
  api -.->|stdout| logs[(pino structured logs)]
  api -->|signs / verifies| jwt[[JWT HS256 + JWT_SECRET]]
```

Three runtime services in the local Docker compose stack (`web`, `api`, `mongo`); production splits them across **Vercel** (web), **Render** (api), and **MongoDB Atlas** (db). Frontend talks to backend only through `/api/*` — in production via the configured `VITE_API_URL`; in compose-only setups, nginx proxies `/api` to the api service.

## Request pipeline (API)

```mermaid
flowchart TB
  req([Incoming request])
  req --> trust[trust proxy: 1<br/>real client IP from X-Forwarded-For]
  trust --> helmet[helmet security headers]
  helmet --> cors[CORS allowlist<br/>env.CORS_ORIGIN comma-split]
  cors --> compression[gzip compression]
  compression --> body[express.json 100kb limit]
  body --> http[pino-http access log<br/>redacts Authorization + Cookie]
  http --> route{Route match?}
  route -- no --> nf[notFound 404]
  route -- yes --> rate[rate limiter<br/>auth: 20/15min · writes: 60/min]
  rate --> auth[requireAuth<br/>JWT verify → req.user]
  auth --> role[requireRole<br/>optional admin layer]
  role --> validate[validate<br/>Zod schemas: body, query, params]
  validate --> ctrl[Controller — thin]
  ctrl --> svc[Service — business logic]
  svc --> mongo[(Mongoose / Mongo Atlas)]
  svc --> ctrl
  ctrl --> res([JSON envelope])
  ctrl -.->|throws AppError or unknown| err[errorHandler<br/>mounted last]
  err --> res
  nf --> err
```

Mounting order is enforced in [Backend/src/app.ts](Backend/src/app.ts):

```text
helmet → cors → compression → json → pino-http → /api router → notFound → errorHandler
```

`errorHandler` is last so any `next(err)` flows through it. `AppError` maps to a structured `{ error: { code, message, details? } }` envelope; unknown errors get a generic `500 INTERNAL`.

## Primary workflow — Sales user creates and filters leads

```mermaid
sequenceDiagram
  autonumber
  actor S as Sales user
  participant UI as React + React Query
  participant AX as axios + JWT interceptor
  participant API as Express
  participant SVC as leads service
  participant DB as MongoDB Atlas

  S->>UI: Submit register or login form
  UI->>AX: POST /auth/register | /auth/login
  AX->>API: HTTP + JSON body
  API->>SVC: registerUser / loginUser (bcrypt + sign)
  SVC->>DB: User.findOne / create
  DB-->>SVC: doc
  SVC-->>API: { user, token }
  API-->>UI: 201 / 200 envelope
  UI->>UI: authStore.setSession(token, user)<br/>persist token to localStorage

  S->>UI: Open /leads, type "Rahul" in search
  Note over UI: useDebounce(value, 500ms)<br/>trim() before forming the query key
  UI->>AX: GET /leads?search=Rahul&status=Qualified&page=1
  AX->>API: Authorization: Bearer <jwt>
  API->>API: validate(listLeadsQuerySchema)<br/>requireAuth (decode → req.user)
  API->>SVC: listLeads(query, viewer)
  SVC->>SVC: buildFilter (async)<br/>viewer.role !== 'admin' ⇒ filter.createdBy = viewer.id<br/>admin + query.owner ⇒ resolve email → User._id
  SVC->>DB: countDocuments + find().sort().skip().limit(10)
  DB-->>SVC: docs + total
  SVC-->>API: { data, meta }
  API-->>UI: 200 envelope
  UI->>UI: React Query caches by queryKey = ['leads','list', query]

  S->>UI: Click Export CSV
  UI->>AX: fetch /leads/export.csv (bearer in headers)
  AX->>API: GET + same query params
  API->>SVC: listAllFilteredLeads(query, viewer)
  SVC->>DB: find().lean() with current filter
  DB-->>SVC: array
  SVC-->>API: AsyncParser.parse(rows) → csv string
  API-->>UI: text/csv with Content-Disposition: attachment
  UI->>UI: blob → object URL → <a download>
```

Every authenticated request shares the same middleware order: `requireAuth` first, then any `requireRole(...)` layer, then `validate({ body, query, params })`, then controller. Errors bubble to a single `errorHandler` at the end of the chain.

## Admin workflow — Team page + per-user drill-in

```mermaid
sequenceDiagram
  autonumber
  actor A as Admin
  participant UI as React + React Query
  participant API as Express
  participant SVC as team + leads services
  participant DB as MongoDB Atlas

  A->>UI: Navigate to /team
  UI->>API: GET /team (bearer)
  API->>API: requireAuth → requireRole('admin')
  API->>SVC: listTeam()
  SVC->>DB: User.find({}, { name, email, role }).lean()
  SVC->>DB: Lead.aggregate([{ $group: { _id: '$createdBy',<br/>total, newCount, contacted, qualified, lost via $cond } }])
  DB-->>SVC: users + aggregates
  SVC->>SVC: Merge user docs with aggregate map by _id
  SVC-->>API: { summary, members }
  API-->>UI: 200 envelope
  UI->>UI: Render KPI tiles + members table (cards below md)

  A->>UI: Click "View leads" on a row
  UI->>UI: navigate(`/leads?owner=${email}`)
  UI->>API: GET /leads?owner=<email>&page=1 (bearer)
  API->>SVC: listLeads with admin viewer
  SVC->>SVC: buildFilter resolves<br/>query.owner → User.findOne({ email }) → createdBy
  SVC->>DB: find with filter
  DB-->>API: docs
  API-->>UI: filtered list
```

Sales users hitting `/team` get `403 FORBIDDEN` from `requireRole('admin')`. Sales users passing `?owner=...` to `/leads` get their owner silently ignored — their own `createdBy = viewer.id` line wins inside `buildFilter`.

## Dashboard read-API workflow

```mermaid
sequenceDiagram
  participant UI as Dashboard widgets
  participant API as Express
  participant DB as MongoDB Atlas

  UI->>API: GET /dashboard/overview (bearer)
  API->>API: requireAuth
  par 3 parallel queries
    API->>DB: DashboardKpi.find().sort({ order: 1 })
  and
    API->>DB: ChartSeries.findOne({ chartKey: 'userChart' })
  and
    API->>DB: TrafficAggregate.find()
  end
  DB-->>API: results
  API-->>UI: { kpis, userChart, trafficByWebsite, trafficByDevice,<br/>trafficByLocation, marketingMonthly }

  Note over UI: Right drawer fans out three more reads:<br/>useNotifications() + useActivities() + useContacts()
  par 3 parallel queries
    UI->>API: GET /notifications (role-scoped audience filter)
    UI->>API: GET /activities (populate actor name/email/role; limit 20)
    UI->>API: GET /contacts (populate linkedUser; alphabetical)
  end
```

All dashboard collections are seeded by `pnpm seed` and are intentionally read-only at the application layer — they're updated via the seed script, not user actions.

## Data model

```mermaid
erDiagram
  USER ||--o{ LEAD : "createdBy"
  USER ||--o{ ACTIVITY : "actor"
  USER ||--o| CONTACT : "linkedUser (optional)"

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

  ACTIVITY {
    ObjectId _id PK
    ObjectId actor FK "ref: User"
    string   action
    date     createdAt
  }

  CONTACT {
    ObjectId _id PK
    string   name
    string   email "optional"
    string   avatar "optional"
    ObjectId linkedUser FK "ref: User, optional"
  }

  NOTIFICATION {
    ObjectId _id PK
    string   kind "bug | user | lead-status | subscribe | ..."
    string   message
    string   audience "admin | sales | all"
    date     createdAt
  }

  DASHBOARDKPI {
    ObjectId _id PK
    string   key "views | visits | newUsers | activeUsers"
    string   title
    string   value
    string   change
    boolean  positive
    string   bgKey
    number   order
  }

  CHARTSERIES {
    ObjectId _id PK
    string   chartKey "unique"
    string[] xAxis
    object[] series "[{ name, data[], color, dashed }]"
  }

  TRAFFICAGGREGATE {
    ObjectId _id PK
    string   kind "website | device | location | marketing, unique"
    Mixed[]  rows
  }
```

Indexes:

- `User.email` — unique.
- `Lead.createdBy` — single-field (filter for sales users).
- `Lead.status` and `Lead.source` — single-field (frequent filters).
- `Lead.{createdBy:1, createdAt:-1}` — compound (covers the sales-user list query pattern).
- `Lead.{name:'text', email:'text'}` — text index (kept for future full-text upgrade; current search uses escaped regex for partial matches).
- `Activity.{createdAt:-1}` — recent-first sort.
- `Activity.actor` — for populate joins.
- `Contact.{name:1}` — alphabetical list.
- `Contact.linkedUser` — for populate joins.
- `Notification.{audience:1, createdAt:-1}` — role-scoped feed.
- `ChartSeries.chartKey` — unique.
- `TrafficAggregate.kind` — unique (one document per kind).
- `DashboardKpi.key` — unique.

In production `autoIndex: false` is set on Mongoose — these are not auto-synced on boot; create them manually via Atlas or `db.collection.createIndexes()` after the first deploy.

## Known limitations

- **Type drift** between Backend Zod schemas (the source of truth) and Frontend interfaces ([Frontend/src/types/](Frontend/src/types/)). Mitigated by CI lint+typecheck on both sides. pnpm workspaces are in place (see [ADR 0006](docs/ADRs/0006-pnpm-workspaces.md)); next step is to add a `packages/shared` workspace for the schemas.
- **Token in localStorage** is XSS-exposed. Trade-off documented in [ADR 0005](docs/ADRs/0005-token-in-localstorage.md); CSP and httpOnly-cookie migration in the roadmap.
- **No refresh tokens**. The access token simply expires after `JWT_EXPIRES_IN`; the user re-logs in.
- **CSV export is array-based** (`Lead.find().lean()` → `AsyncParser.parse(rows)`). Bounded by available heap. Mitigation: switch to `.cursor()` + stream Transform for unbounded exports; gate beyond N rows with a job queue.
- **In-memory rate limiter**. Multi-dyno deployments need a shared store (`rate-limit-redis`).
- **No tests**. Smoke-only via `pnpm build` in CI. Vitest is in the roadmap; would slot into both workspaces without restructuring.
- **No observability** (Sentry/OTel). Logs are stdout only — Render captures them; for richer pipelines, add a pino transport.
- **Dashboard data is seeded, not user-driven**. The KPI/chart/traffic collections update only when `pnpm seed` re-runs. Treat them as demo content; a real product would compute them from leads + events.

## Evolution paths

- **`packages/shared/`** (Zod schemas + inferred types + API path constants) and migrate both apps to consume it. Eliminates the manual type mirror.
- **httpOnly refresh-token cookies + short-lived access JWT in memory**. Add CSRF token for cookie-based auth.
- **Job queue** (BullMQ + Redis) for the CSV export to remove the synchronous response constraint.
- **Sentry + OpenTelemetry** at the error handler and pino transport.
- **Computed dashboard** — replace the seeded reference collections with aggregations over `leads` + `activities` so the dashboard reflects real product state.
- **Manual chunks** in Vite (`echarts` → separate vendor bundle) to bring the frontend gzip from 593 KB to ~300 KB.
