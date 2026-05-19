# Setup — third-party services

This walks through standing up the external dependencies Leadsrack needs. For local dev with
Docker compose, only step 2 is required (MongoDB runs as a compose service).

## MongoDB Atlas

The fastest way to a managed MongoDB for cloud deploys is Atlas's free M0 cluster.

1. Sign in at <https://cloud.mongodb.com> and create a new project.
2. **Create a cluster** — pick "M0 free" in your region of choice. Wait ~3 minutes for provisioning.
   <!-- TODO: screenshot — Atlas cluster create -->
3. **Create a database user** — Atlas → Database Access → Add New Database User. Use SCRAM auth, give it `readWriteAnyDatabase` for the dev environment (tighten in production).
   <!-- TODO: screenshot — Atlas db user -->
4. **Allow your IP** — Atlas → Network Access → Add IP. For development you can choose "Allow Access from Anywhere" (`0.0.0.0/0`); **lock this down for production** to the deploy host's IP.
   <!-- TODO: screenshot — Atlas network access -->
5. **Get the connection string** — Atlas → Database → Connect → Drivers → Node.js. Copy the URI; it looks like:

   ```
   mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/leadsrack?retryWrites=true&w=majority
   ```

   Paste it into `Backend/.env` as `MONGODB_URI`. Replace `<user>` and `<pass>` with the user you created in step 3.

## JWT signing key

```bash
openssl rand -base64 48
```

Copy the output into `JWT_SECRET` in `Backend/.env` (and into the root `.env` if you're using
docker compose). Minimum 32 characters — the Zod env loader rejects shorter values.

## Local development without Docker

```bash
# Repo root: install dev tooling (husky etc.)
pnpm install

# Backend
cd Backend
pnpm install
cp .env.example .env             # fill MONGODB_URI and JWT_SECRET
pnpm seed                        # admin + sales + 25 leads (idempotent)
pnpm dev                         # http://localhost:4000

# Frontend (new terminal)
cd Frontend
pnpm install
cp .env.example .env             # VITE_API_URL=http://localhost:4000/api
pnpm dev                         # http://localhost:3000
```

Seeded users (default passwords printed by `pnpm seed`):

- `admin@leadsrack.local` / `admin123!`
- `sales@leadsrack.local` / `sales123!`

**Change these in production.** They exist only to give a fresh-clone reviewer something to log
in with.

## Docker compose (full stack)

```bash
cp .env.example .env             # repo root — set JWT_SECRET
docker compose up --build
```

Three containers will start: `mongo`, `api`, `web`. The api waits for mongo's healthcheck
before booting.

Open <http://localhost:8080> for the UI and <http://localhost:4000/api/health> for the API.

To seed the dockerised database:

```bash
# Compile-then-run (the api image's build stage already compiled it):
docker compose exec api node dist/seed.js

# Or, if running a dev image with tsx available:
docker compose exec api sh -c "pnpm exec tsx src/seed.ts"
```

To stop and wipe data:

```bash
docker compose down -v           # -v removes the mongo_data volume
```

## Production deploys

| Component | Recommended target | Notes |
| --- | --- | --- |
| Web | Netlify, Vercel, Cloudflare Pages | Static `dist/`. `Frontend/netlify.toml` already configured. Set `VITE_API_URL` at build time. |
| API | Render, Railway, Fly.io | Use `Backend/Dockerfile`. Set all `Backend/.env.example` vars in the host's secrets UI. |
| DB | MongoDB Atlas | Lock the network allowlist to the API host's egress IPs. |

The API's `app.set('trust proxy', 1)` is set, so rate-limit IP detection works correctly behind
a single-hop load balancer or reverse proxy. Adjust the value if you front it with more layers.

## Troubleshooting

- **`MongooseServerSelectionError`** — your `MONGODB_URI` is wrong, or Atlas's IP allowlist is
  blocking the call. Re-check both.
- **`Invalid environment configuration: [ JWT_SECRET ]`** — your `JWT_SECRET` is missing or
  shorter than 32 chars. Generate a longer one.
- **`CORS_ORIGIN` mismatch in the browser console** — the API rejects requests whose `Origin`
  isn't in the allowlist. Add the frontend's origin (comma-separated for multiple).
- **`429 RATE_LIMITED` on every login attempt** — you're hitting the auth rate limit (20 req /
  15 min / IP). Wait, or relax the limit for development in `Backend/src/middleware/rateLimit.ts`.
- **Husky doesn't fire on commit** — ensure the repo root install ran (`pnpm install` from the
  root, not inside `Backend/` or `Frontend/`). The `prepare` script initialises `.husky/_/`.
