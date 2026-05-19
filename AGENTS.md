# AGENTS.md — agent notes for Leadsrack

Path-anchored map for AI coding agents working in this repo. Terse. Read once per session.

Compatible with Claude Code, Cursor, GitHub Copilot, Windsurf, Aider, and any other agent that
reads root-level `AGENTS.md`. Symlinking `CLAUDE.md → AGENTS.md` (or vice versa) is fine.

## Repo shape

```text
Leadsrack/
├─ Frontend/   React 19 + Vite 6 + TS + Tailwind 3. Own pnpm install, own lockfile.
├─ Backend/    Express 5 + TS + Mongoose 8. Own pnpm install, own lockfile.
├─ docs/       API.md, SETUP.md, ADRs/
├─ .github/    workflows (CI), templates
├─ .husky/     pre-commit, commit-msg, pre-push
├─ render.yaml Render Blueprint for the API service
└─ root-only   tooling (husky, commitlint, lint-staged, prettier). NO workspaces.
```

Two independent apps. The root `package.json` ships dev tooling only — there is no
workspace orchestrator. Run `pnpm install` separately in `Frontend/` and `Backend/`.

## Commands

```bash
# From repo root (one-time tooling install)
pnpm install            # husky + commitlint + lint-staged + prettier

# From Frontend/
pnpm install
pnpm dev                # vite, http://localhost:3000
pnpm lint && pnpm typecheck && pnpm build

# From Backend/
pnpm install
pnpm dev                # tsx watch, http://localhost:4000
pnpm seed               # idempotent: 3 users + 25 leads + dashboard data
pnpm lint && pnpm typecheck && pnpm build && pnpm start

# Docker (from repo root)
docker compose up --build
```

## Where things live

| Concern                                  | Path                                                                                                             |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| API entry                                | `Backend/src/server.ts` → `Backend/src/app.ts`                                                                   |
| API routes                               | `Backend/src/routes/index.ts` (mounts under `/api`)                                                              |
| Zod schemas (source of truth for shapes) | `Backend/src/schemas/`                                                                                           |
| Mongoose models (8)                      | `Backend/src/models/` — User, Lead, DashboardKpi, ChartSeries, TrafficAggregate, Activity, Contact, Notification |
| Business logic                           | `Backend/src/services/` — auth, leads, team, csv (controllers are thin)                                          |
| Error class                              | `Backend/src/lib/errors.ts` (`AppError` + helpers like `notFound`, `forbidden`)                                  |
| Env loader                               | `Backend/src/config/env.ts` (Zod-validated, fail-loud on bad config)                                             |
| Logger                                   | `Backend/src/lib/logger.ts` (pino, redacts `Authorization` / `Cookie`)                                           |
| Mongo connect                            | `Backend/src/config/db.ts` (autoIndex off in prod, pool size 10)                                                 |
| Web entry                                | `Frontend/src/main.tsx` → `Frontend/src/App.tsx` (providers + router)                                            |
| Web routes                               | `Frontend/src/routes/AppRoutes.tsx` (nests `ProtectedRoute` + `AdminRoute`)                                      |
| Web auth/theme/ui state                  | `Frontend/src/store/{authStore,themeStore,uiStore}.ts` (zustand)                                                 |
| Web API client                           | `Frontend/src/lib/api.ts` (axios + bearer interceptor) + `Frontend/src/api/*`                                    |
| Web types mirroring backend Zod          | `Frontend/src/types/{api,dashboard,team}.ts`                                                                     |
| Design tokens                            | `Frontend/tailwind.config.js` + CSS vars in `Frontend/src/index.css`                                             |
| Architecture decisions                   | `docs/ADRs/0001..0005-*.md`                                                                                      |
| Deployment IaC                           | `render.yaml` (root) + `Frontend/vercel.json`                                                                    |

## Conventions

- **TypeScript strict.** `noUncheckedIndexedAccess: true`. No `any` without an inline justification comment.
- **Validation at HTTP boundaries** via Zod (`validate({ body, query, params })` middleware). Schemas in `Backend/src/schemas/` are the source of truth for request shapes.
- **API response envelope**: `{ data, meta? }` on success; `{ error: { code, message, details? } }` on failure.
- **Pagination meta**: `{ total, page, limit, totalPages }`. `limit` is fixed at 10.
- **Errors** flow through `next(err)` to the single `errorHandler` middleware (mounted last in `app.ts`). Throw `AppError` from services; never `res.status().json(...)` an error inline.
- **Auth header**: `Authorization: Bearer <jwt>`. Token in localStorage on the client ([ADR 0005](docs/ADRs/0005-token-in-localstorage.md)).
- **RBAC**: `requireAuth` first, then `requireRole(...)`; ownership checks live in the **service layer** for leads (sales users only see/touch their own; admin sees all). The middleware factory pattern is documented in [ADR 0003](docs/ADRs/0003-rbac-via-middleware-factory.md).
- **Conventional Commits** enforced by `commit-msg` hook (max 100-char header). Hook bypass (`--no-verify`) is not a normal workflow.
- **Pre-push** runs `pnpm lint && pnpm typecheck && pnpm build` on both workspaces. Do not skip.
- **Imports** use relative paths inside each workspace; no `../../../..` chains (split files instead).

## Things to avoid

- Re-introducing any string from `dualite | data-ds | ByeWind | snowui | s3-alpha-sig` — those were scrubbed and their reappearance is a regression.
- Hardcoded URLs. Dynamic config comes from env (`VITE_API_URL` on the web, the `env.ts` loader on the api).
- Adding a feature outside `docs/API.md`'s endpoint list. If it isn't in `docs/API.md`, it doesn't ship — it goes in `README.md`'s Roadmap.
- Creating a `utils.ts` bag. New utilities go in a named module under `lib/`.
- Files over ~300 lines without a split.
- Mixing `fetch` and `axios` on the client; axios is the standard.
- Replacing `bcryptjs` with `bcrypt` — `bcryptjs` is intentional for Docker portability (pure JS, no native binding).
- Bumping `lucide-react` past `^0.4xx` without auditing every icon import (older `^1.16.0` line had a different API).

## Stack quirks

- **Tailwind v3**, not v4. Color tokens are CSS vars driven from `Frontend/src/index.css` `:root` and `:root.dark`; the Tailwind config wires them via `rgb(var(--c-fg) / <alpha-value>)`.
- **Pinned safelist** in `tailwind.config.js` for dynamic class names (`bg-accent-*`, `bg-stat-*`) — extend it before adding a new accent.
- **`autoIndex: false` in production Mongo** — schema-level `.index()` declarations won't auto-sync. Create indexes manually via Atlas UI or `db.collection.createIndexes()` after deploy.
- **CSV export is in-memory** (`@json2csv/node` AsyncParser over `Lead.find().lean()`). For unbounded exports, switch to `cursor()` + stream Transform.
- **Rate limiters** are in-memory (`express-rate-limit` default store). For multi-dyno deploys, migrate to `rate-limit-redis`.
- **JWT secret** is enforced ≥ 32 chars by Zod; the server fail-loud-exits on a shorter value.
- **Health check** at `/api/health` is DB-aware: returns 503 when Mongo is disconnected. Orchestrators (Render, k8s) should use this for readiness.

## Verification checklist (before claiming "done")

```bash
# Both workspaces must pass:
cd Backend  && pnpm typecheck && pnpm lint && pnpm build
cd Frontend && pnpm typecheck && pnpm lint && pnpm build
```

If you touched the API surface:

```bash
# Manual smoke (with server running + seeded DB):
curl http://localhost:4000/api/health
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@leadsrack.local","password":"admin123!"}' | jq -r '.data.token')
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/leads | jq '.meta'
```

If you touched UI components, manually verify in the browser at desktop (`≥ 1024 px`),
tablet (`768 px`), and mobile (`375 px`) widths. Tables should collapse to cards below `md`.

## Memory and session notes (Claude Code only)

The user's auto-memory lives at
`C:\Users\Admin\.claude\projects\c--Users-Admin-Downloads-Leadsrack\memory\`. Update relevant
files when the project state changes materially (folder structure, deps, conventions). Other
agents can ignore this section.
