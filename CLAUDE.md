# CLAUDE.md — agent notes for Leadsrack

Path-anchored map for AI agents working in this repo. Terse. Read once per session.

## Repo shape

```
Leadsrack/
├─ Frontend/   React 19 + Vite 6 + TS + Tailwind 3. Own pnpm install, own lockfile.
├─ Backend/    Express 5 + TS + Mongoose 8. Own pnpm install, own lockfile.
├─ docs/       API.md, SETUP.md, ADRs/
├─ .github/    workflows (CI), templates
├─ .husky/     pre-commit, commit-msg, pre-push
└─ root-only   tooling (husky, commitlint, lint-staged, prettier). NO workspaces.
```

Two independent apps. The root `package.json` ships dev tooling only — there is no
workspace orchestrator. Run `pnpm install` separately in `Frontend/` and `Backend/`.

## Commands

```bash
# From repo root
pnpm install            # husky + commitlint + lint-staged + prettier

# From Frontend/
pnpm install
pnpm dev                # vite, http://localhost:3000
pnpm lint && pnpm typecheck && pnpm build

# From Backend/
pnpm install
pnpm dev                # ts-node-dev, http://localhost:4000
pnpm seed               # idempotent seed: admin + sales + 25 leads
pnpm lint && pnpm typecheck && pnpm build && pnpm start

# Docker (from repo root)
docker compose up --build
```

## Where things live

| Concern | Path |
| --- | --- |
| API entry | `Backend/src/server.ts` → `Backend/src/app.ts` |
| API routes | `Backend/src/routes/index.ts` (mounts under `/api`) |
| Zod schemas (source of truth for shapes) | `Backend/src/schemas/` |
| Mongoose models | `Backend/src/models/` |
| Business logic | `Backend/src/services/` (controllers are thin) |
| Error class | `Backend/src/lib/errors.ts` (`AppError` + helpers) |
| Env loader | `Backend/src/config/env.ts` (Zod-validated) |
| Web entry | `Frontend/src/main.tsx` → `Frontend/src/App.tsx` (providers + router) |
| Web routes | `Frontend/src/routes/AppRoutes.tsx` |
| Web auth/theme state | `Frontend/src/store/{authStore,themeStore}.ts` (zustand) |
| Web API client | `Frontend/src/lib/api.ts` + `Frontend/src/api/*` |
| Web types mirroring backend Zod | `Frontend/src/types/api.ts` |
| Design tokens | `Frontend/tailwind.config.js` |
| Architecture decisions | `docs/ADRs/0001..NNNN-*.md` |

## Conventions

- TypeScript strict. `noUncheckedIndexedAccess: true`. No `any` without an inline justification.
- Validation at HTTP boundaries via Zod (`validate({ body, query, params })` middleware).
- API response envelope: `{ data, meta? }` on success; `{ error: { code, message, details? } }` on failure.
- Pagination meta: `{ total, page, limit, totalPages }`. `limit` is fixed at 10.
- Errors flow through `next(err)` to the single `errorHandler` middleware (mounted last).
- Auth header: `Authorization: Bearer <jwt>`. Token in localStorage on the client (ADR 0005).
- RBAC: `requireAuth` first, then `requireRole(...)`; ownership checks live in the service layer
  for leads (sales users only see/touch their own; admin sees all).
- Conventional Commits enforced by `commit-msg` hook. Hook bypass (`--no-verify`) is not a normal workflow.
- Imports use absolute paths from `tsconfig.json` `paths`. No `../../../..` chains.

## Things to avoid

- Re-introducing any string from `dualite | data-ds | ByeWind | snowui | s3-alpha-sig` — those
  were scrubbed; their presence is a regression. The previous turn's plan
  (`analyse-this-whole-exisiting-nifty-wadler.md`) documents the cleanup.
- Hardcoded URLs. Anything dynamic comes from env (`VITE_API_URL` on the web, the `env.ts`
  loader on the api).
- Adding a feature outside `docs/API.md`'s endpoint list. If it isn't here, it doesn't ship —
  it goes in `README.md`'s Roadmap.
- Creating a `utils.ts` bag. New utilities go in a named module.
- Files over ~300 lines without a split.

## Stack quirks

- `lucide-react` is pinned at `^1.16.0` (old API; current is `^0.4xx`). Don't bump without
  auditing icon imports.
- Tailwind is **v3**, not v4. Tokens defined in `Frontend/tailwind.config.js` (`extend.colors`).
- `axios` is the HTTP client. Don't introduce `fetch`-wrappers alongside it.
- Backend uses `bcryptjs` (pure JS) not `bcrypt` (native) for Docker portability.

## Memory

The user's auto-memory lives at
`C:\Users\Admin\.claude\projects\c--Users-Admin-Downloads-Leadsrack\memory\`. Update relevant
files when the project state changes materially (folder structure, deps, conventions).
