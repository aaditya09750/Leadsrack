# ADR 0006 — Adopt pnpm workspaces (single root lockfile)

- **Status**: Accepted
- **Date**: 2026-05-20
- **Supersedes**: [ADR 0001](0001-no-monorepo-tooling.md)

## Context

[ADR 0001](0001-no-monorepo-tooling.md) chose two independent apps with their own
`pnpm install`, lockfile, and `node_modules` — explicitly to avoid `apps/`/`packages/`
churn and the cognitive cost of workspace `--filter` flags.

The actual operational pain that emerged:

- A fresh clone required three `pnpm install` runs (root + Frontend + Backend) and lost
  ~30 seconds to redundant resolution and store-linking.
- Two app-level lockfiles drifted from each other — patch-version pnpm bumps would resolve
  shared transitives differently in each app.
- Two CI surfaces had to be installed and cached separately.
- `packageManager` was pinned in each app's `package.json` (per the Render pnpm 11
  release-age fix in commit `ce85491`) but not at the root, leaving the root version
  unpinned.

## Decision

Adopt pnpm workspaces in their **minimal** form, preserving every existing path:

- Add `pnpm-workspace.yaml` at the root declaring `Frontend` and `Backend` as the two
  workspace packages. No `apps/` or `packages/` rename.
- Single `pnpm-lock.yaml` at the root. Delete `Frontend/pnpm-lock.yaml` and
  `Backend/pnpm-lock.yaml`.
- Pin `packageManager: "pnpm@10.30.0"` in the root `package.json` (consolidates the
  per-app pin from ADR 0005-era work).
- Inject `zod` as a peer of `@hookform/resolvers` via `pnpm.packageExtensions` — the
  resolver declares zod as a peer in a subpath `package.json`, which pnpm doesn't honor;
  workspaces exposed this via a TypeScript-only typecheck failure.
- Do **not** adopt Turborepo, `apps/`, `packages/`, scope renames (`@leadsrack/*`), or
  shared packages. Those remain available for later when the cost/benefit flips.

Deploy adjustments:

- **Vercel** (Frontend): `installCommand` → `cd .. && pnpm install --frozen-lockfile --filter ./Frontend...`.
  Dashboard toggle **Include source files outside of the Root Directory** = ON so the
  build runner sees the root lockfile.
- **Render** (Backend): switched the Blueprint to `runtime: docker` with explicit
  `dockerfilePath: ./Backend/Dockerfile` and `dockerContext: .`. Rewrote
  `Backend/Dockerfile` to expect the repo root as build context (copies workspace
  manifests + `Backend/`, runs `pnpm install --filter ./Backend...`, builds, then
  reinstalls `--prod --ignore-scripts` in the runtime stage to skip the root
  `prepare: husky` lifecycle).
- Root `.dockerignore` added because Docker reads `.dockerignore` from the build context
  root (no longer `Backend/.dockerignore`).

## Consequences

**Positive**

- One `pnpm install` from the root installs both apps. Onboarding documented in
  [README.md](../../README.md#option-b--two-terminals-no-docker) and
  [SETUP.md](../SETUP.md#option-a--two-terminals-no-docker) collapses to a single command.
- Single lockfile — no drift between apps, deterministic resolution.
- `packageManager` is pinned in one place (root) and applies to every workspace via
  Corepack.
- Render's `buildFilter` now skips API redeploys when only Frontend files change.

**Negative**

- One-time Render dashboard touch was required: when a service was originally created
  with `rootDir: Backend`, Render's blueprint sync does **not** override
  `rootDir`/`dockerContext`/`dockerfilePath` on the existing service. Set in the
  dashboard manually once:
  - Root Directory: empty
  - Dockerfile Path: `./Backend/Dockerfile`
  - Docker Build Context Directory: `.`
- The `prepare: husky` lifecycle script must be skipped in production install (Docker
  runtime stage uses `--ignore-scripts`). Husky is a dev-only tool and cannot resolve in
  `--prod` mode.
- `@hookform/resolvers` and any future package that declares peer deps only in a subpath
  `package.json` need explicit `pnpm.packageExtensions` entries. Documented in the root
  `package.json`.

## Evolution

The workspace is now in place to host shared code. The natural next step is
`packages/shared/` containing the Zod schemas (currently in `Backend/src/schemas/`) plus
inferred types — eliminating the manual Frontend↔Backend type mirror in
`Frontend/src/types/`. That migration is listed in the [README roadmap](../../README.md#roadmap)
and is a follow-up, not part of this ADR.

If future scale demands it (4+ apps, slow CI from redundant builds), Turborepo can be
layered on top of the existing workspace without rework — it's strictly additive to pnpm.
