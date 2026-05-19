# Leadsrack API

Express 5 + TypeScript + Mongoose. See the root [`README.md`](../README.md) for the project
overview and full quick start.

## Local development

```bash
pnpm install
cp .env.example .env       # fill MONGODB_URI and a real JWT_SECRET
pnpm seed                  # idempotent: admin + sales + 25 leads
pnpm dev                   # http://localhost:4000
```

## Scripts

- `pnpm dev` — tsx watch with auto-reload
- `pnpm build` — tsc to `dist/`
- `pnpm start` — run the compiled server
- `pnpm lint` / `pnpm lint:fix`
- `pnpm typecheck`
- `pnpm seed`

## Layout

```
src/
├─ config/         env (Zod-validated) + db (mongoose connect)
├─ controllers/    thin: parse → service → respond
├─ lib/            logger, errors, asyncHandler
├─ middleware/     auth, requireRole, validate, errorHandler, notFound, rateLimit
├─ models/         Mongoose schemas (User, Lead)
├─ routes/         express routers
├─ schemas/        Zod schemas — source of truth for request shapes
├─ services/       business logic
├─ types/          express type augmentation
├─ app.ts          app factory (no listen)
├─ seed.ts         idempotent seed
└─ server.ts       entry — connectDB + listen + shutdown
```

See [`docs/API.md`](../docs/API.md) for the endpoint catalogue.
