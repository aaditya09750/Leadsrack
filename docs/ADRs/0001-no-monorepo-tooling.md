# ADR 0001 — No monorepo workspaces; two independent apps

- **Status**: Superseded by [ADR 0006](0006-pnpm-workspaces.md) (2026-05-20)
- **Date**: 2026-05-19

## Context

The repo holds a frontend (`Frontend/`) and a backend (`Backend/`) that share an API contract
defined by Zod schemas. A standard monorepo (`apps/web` + `apps/api` + `packages/shared`) with
pnpm workspaces would let both consume the same schemas, eliminating any drift risk.

Trade-offs considered:

- **Strict workspaces (pnpm `pnpm-workspace.yaml`)** — clean type sharing via
  `packages/shared`, but requires reorganising every existing path, teaching reviewers about
  workspace `--filter` flags, and adding a workspace orchestrator.
- **Per-app installs, no workspaces** — each app has its own lockfile and `node_modules`.
  Shared types are mirrored by hand. Reviewers run `pnpm install` in each folder.

## Decision

Keep the two apps independent. Each owns its `package.json`, `pnpm-lock.yaml`, `tsconfig.json`,
and `node_modules`. The repo root holds only cross-cutting dev tooling (husky, commitlint,
lint-staged, prettier) via a thin `package.json` without `workspaces`.

Frontend types live in [`Frontend/src/types/api.ts`](../../Frontend/src/types/api.ts) and are
manually kept in sync with the Backend's Zod schemas in
[`Backend/src/schemas/`](../../Backend/src/schemas/).

## Consequences

**Positive**

- Zero churn on existing paths — every file the reviewer reads is exactly where they expect.
- Each app boots independently; CI jobs are simpler.
- No `--filter` flag in any script.

**Negative**

- Type drift is possible. Mitigated by:
  - Only two entities (User, Lead) — the surface is small.
  - Both apps run `lint` + `typecheck` + `build` in CI; a backend change to the response shape
    that the frontend doesn't mirror will compile but break at runtime. The functional smoke
    in the README quick-start would catch this.
- Bumping the same dependency in both apps is a two-step operation.

## Evolution

If the project grows beyond two entities or onboards a third app (mobile, admin SPA),
introduce `packages/shared` and migrate. The type-drift cost becomes unacceptable past about
~5 entities or any moderate API surface area.

## Superseded — 2026-05-20

Reversed by [ADR 0006](0006-pnpm-workspaces.md). The "per-app installs" stance survived for
exactly one onboarding pass before the duplicate-install friction outweighed the perceived
churn cost of adopting workspaces. The minimal-workspace migration (just `pnpm-workspace.yaml`

- a single root lockfile, no `apps/`/`packages/` rename, no Turborepo) preserved every path
  this ADR was trying to protect, so the original "zero churn" benefit was kept intact.
  Shared types in `packages/shared` remain a future step; the workspace is now in place to
  host it when needed.
