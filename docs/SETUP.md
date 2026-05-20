# Setup guide

End-to-end walkthrough for getting Leadsrack running locally and deployed to production.

- [Local development](#local-development) — clone-to-running in ~5 minutes.
- [MongoDB Atlas](#mongodb-atlas) — managed database (free tier).
- [Production deploy](#production-deploy) — Backend → Render, Frontend → Vercel.
- [Troubleshooting](#troubleshooting) — common errors and fixes.

## Local development

### Prerequisites

- Node.js 22+ (`nvm install 22 && nvm use 22`).
- pnpm 10+ (`corepack enable && corepack prepare pnpm@latest --activate`).
- A MongoDB instance: local `mongod` on port `27017`, or an Atlas cluster.
- (Optional) Docker Desktop / Docker Compose for the bundled stack.

### Option A — Two terminals (no Docker)

```bash
# Repo root: one install handles both apps (pnpm workspaces, single root lockfile)
pnpm install

# Backend (terminal 1)
cp Backend/.env.example Backend/.env       # fill MONGODB_URI + JWT_SECRET
pnpm --filter ./Backend seed               # idempotent: 3 users + 25 leads + dashboard data
pnpm --filter ./Backend dev                # http://localhost:4000

# Frontend (terminal 2)
cp Frontend/.env.example Frontend/.env     # VITE_API_URL=http://localhost:4000/api
pnpm --filter ./Frontend dev               # http://localhost:3000
```

### Option B — Docker Compose

```bash
cp .env.example .env                # repo root — set JWT_SECRET
docker compose up --build
```

Three containers start: `mongo`, `api`, `web`. The api waits for mongo's healthcheck before booting.

Open <http://localhost:8080> for the UI and <http://localhost:4000/api/health> for the API.

Seed the dockerised database (one-time):

```bash
docker compose exec api node dist/seed.js
```

Stop and wipe data:

```bash
docker compose down -v              # -v removes the mongo_data volume
```

### Seeded credentials

| Role  | Email                      | Password      |
| ----- | -------------------------- | ------------- |
| admin | `admin@leadsrack.local`    | `admin123!`   |
| sales | `sales@leadsrack.local`    | `sales123!`   |
| sales | `aadigunjal0975@gmail.com` | `aaditya123!` |

**Rotate these in production.** They exist only to give a fresh-clone reviewer something to log in with.

### JWT signing key

The API enforces a minimum 32-character `JWT_SECRET` via Zod env validation. Generate one with:

```bash
openssl rand -base64 48
```

Paste the output into `Backend/.env` as `JWT_SECRET`. On Render the `render.yaml` Blueprint auto-generates this on first deploy (`generateValue: true`).

## MongoDB Atlas

The fastest path to a managed MongoDB for cloud deploys is Atlas's free M0 cluster.

1. **Sign up / sign in** at <https://cloud.mongodb.com> and create a project.
2. **Create a cluster** — pick "M0 free" in your nearest region. Provisioning takes ~3 minutes.
3. **Database Access** → Add New Database User → SCRAM auth → grant `readWriteAnyDatabase` for dev (tighten in production).
4. **Network Access** → Add IP Address → `0.0.0.0/0` for free-tier deploys whose outbound IPs are dynamic (e.g. Render free tier). **Lock this down to your deploy host's egress IPs in production.**
5. **Get the connection string** — Atlas → Database → Connect → Drivers → Node.js. It looks like:

   ```text
   mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/leadsrackDB?retryWrites=true&w=majority
   ```

   Paste it into `Backend/.env` as `MONGODB_URI`. Make sure the database name (`leadsrackDB`) is in the path — without it, MongoDB writes to a default `test` database.

6. **Verify** locally: `cd Backend && pnpm seed`. You should see `mongodb connected` then `users + leads seed complete` and `dashboard seed complete`. Browse to Atlas → Collections → `leadsrackDB` to see all 8 collections populated.

## Production deploy

Production splits across three vendors:

- **Backend → Render** via the Blueprint at [`render.yaml`](../render.yaml).
- **Frontend → Vercel** via [`Frontend/vercel.json`](../Frontend/vercel.json).
- **Database → MongoDB Atlas** (free tier is sufficient for review).

### 1. Backend — Render Blueprint

1. Push to GitHub.
2. Render dashboard → **New → Blueprint → connect this repo**. Render auto-detects `render.yaml` and provisions the `leadsrack-api` service.
3. In the dashboard, fill the two `sync: false` env vars:
   - `MONGODB_URI` — Atlas connection string from above.
   - `CORS_ORIGIN` — your Vercel URL (placeholder OK for first deploy; update after step 2).
4. Render auto-generates `JWT_SECRET` (`generateValue: true`). Rotate it later by deleting the variable in the dashboard and redeploying.
5. **One-time seed** — Render dashboard → Shell tab → `pnpm seed`. This creates users + leads + dashboard data.
6. **Sanity check** — `https://<your-service>.onrender.com/api/health` should return `{ "status": "ok", "db": "connected" }`.

### 2. Frontend — Vercel

1. Vercel dashboard → **New Project → Import this repo**. Set **Root directory** to `Frontend` (Vercel auto-detects Vite via `vercel.json`).
2. **Environment variables**: `VITE_API_URL = https://<your-render-service>.onrender.com/api`.
3. **Deploy**. The SPA rewrite in `vercel.json` makes hard-refreshes on `/leads` or `/team` work correctly.

### 3. Wire the two together

Once Vercel assigns a production URL (e.g. `https://leadsrack.vercel.app`):

1. Return to Render → Environment → update `CORS_ORIGIN` to the Vercel URL (no trailing slash). For multiple origins (preview URLs), use a comma-separated list.
2. **Manual Deploy** in Render to pick up the change.

### Post-deploy smoke

```bash
# Health
curl https://<render-service>.onrender.com/api/health

# Login as admin
TOKEN=$(curl -s -X POST https://<render-service>.onrender.com/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@leadsrack.local","password":"admin123!"}' \
  | jq -r '.data.token')

# Verify the leads endpoint
curl -s -H "Authorization: Bearer $TOKEN" \
  https://<render-service>.onrender.com/api/leads | jq '.meta'

# Verify the admin team endpoint
curl -s -H "Authorization: Bearer $TOKEN" \
  https://<render-service>.onrender.com/api/team | jq '.data.summary'
```

Then open the Vercel URL in a browser, log in, and confirm the dashboard renders + leads filter + CSV exports.

### Deployment notes

- **Render free tier sleeps after 15 minutes of inactivity.** First request after sleep takes ~30 s while the dyno wakes; subsequent calls are instant. The paid tier removes this.
- **MongoDB Atlas free tier (M0)** caps at 512 MB — more than enough for this dataset.
- **`autoIndex: false` in production** — schema indexes won't auto-sync. Create them manually via Atlas or by running `db.collection.createIndexes()` once after deploy.
- **`BCRYPT_ROUNDS=12`** is set in `render.yaml` (vs `10` locally). Each login takes ~250 ms on Render's free tier; tune down if needed.
- **Vercel preview deployments** have unique URLs per branch — they won't pass CORS unless you add their pattern to `CORS_ORIGIN`. For pure production deploys, this is fine.

## Troubleshooting

### `MongooseServerSelectionError` / connect hangs

- Atlas → Network Access is blocking your IP. Add `0.0.0.0/0` (dev) or your egress IP (prod).
- Wrong user/password in the URI. Re-copy from Atlas → Database Access. URL-encode special chars (`@`, `:`, `/`).
- Wrong DB name. The URI must end with `/<dbname>` (e.g. `/leadsrackDB`) before the `?`.

### `Invalid environment configuration: [ JWT_SECRET ]`

`JWT_SECRET` is missing or shorter than 32 chars. Generate a longer one: `openssl rand -base64 48`.

### `Activity references unknown actorEmail "..."` during `pnpm seed`

The dashboard seed references a user that doesn't exist. After the recent seed refactor this should not happen on a fresh database. If you see it on a re-run, it means the user/lead step succeeded on a previous run but the dashboard step crashed — the seed is now idempotent and finds-or-creates users, so simply re-run `pnpm seed`. If it persists, drop `leadsrackDB` in Atlas and re-seed.

### `users already exist — user/lead seed skipped` followed by dashboard crash

This was the old all-or-nothing logic before the seed refactor. Pull the latest code: `seedUsersAndLeads` now uses `ensureUser` per-user and creates only what's missing.

### CORS error in the browser console

The API's `CORS_ORIGIN` allowlist doesn't include the frontend's origin.

- Local dev: ensure `CORS_ORIGIN=http://localhost:3000` in `Backend/.env`.
- Production: set Render's `CORS_ORIGIN` to your exact Vercel URL (no trailing slash). Multiple origins → comma-separated.

### `429 RATE_LIMITED` on every login attempt

You're hitting the auth rate limit (20 req / 15 min / IP). Wait, or relax in [Backend/src/middleware/rateLimit.ts](../Backend/src/middleware/rateLimit.ts) for development.

### Husky hooks don't fire on commit

Run the root-level install:

```bash
cd <repo-root>
pnpm install
```

The `prepare` script initialises `.husky/_/`. Verify with `git config --get core.hooksPath` — it should print `.husky/_`.

### `commit-msg` hook rejects "header must not be longer than 100 characters"

Commitlint enforces a 100-char limit on commit-message headers. Shorten the title; details belong in the commit body.

### Pre-push fails on `tsc` errors I can't see locally

Ensure the workspace is fully installed (single root install handles both apps):

```bash
pnpm install
```

The pre-push hook runs `pnpm lint && pnpm typecheck && pnpm build` in each workspace — missing deps will tank the typecheck step. If the hook still fails after a fresh install, blow away the local lockfile state and reinstall:

```bash
rm -rf node_modules Frontend/node_modules Backend/node_modules
pnpm install
```

### Vercel build fails — `VITE_API_URL is required`

`Frontend/src/lib/env.ts` throws fail-loud on a missing env var. Set `VITE_API_URL` in Vercel → Project Settings → Environment Variables, then redeploy.

### Render deploy succeeds but `/api/health` returns 503

The service is up but Mongo is unreachable. Check:

1. `MONGODB_URI` is set correctly in Render's env vars (no quoting).
2. Atlas Network Access allows the connection (`0.0.0.0/0` or Render's egress range).
3. The DB user has access to the named database (`leadsrackDB`).
