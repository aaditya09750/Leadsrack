# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial repo scaffolding: husky, commitlint, lint-staged, Prettier, EditorConfig.
- MIT license, contributing guide, code of conduct, security policy.
- Backend (Express 5 + TypeScript + Mongoose) with JWT auth, leads CRUD, filtering, pagination, CSV export, RBAC.
- Frontend (React 19 + Vite + Tailwind 3) auth flow, leads management UI, debounced search, dark-mode toggle.
- Dockerfiles + `docker-compose.yml` for mongo, api, web.
- GitHub Actions CI: lint, typecheck, build.
- README, ARCHITECTURE, API docs, setup walkthrough, ADRs.
- `pnpm-workspace.yaml` + single root `pnpm-lock.yaml` (pnpm workspaces). One `pnpm install` from the root installs both apps. See [ADR 0006](docs/ADRs/0006-pnpm-workspaces.md); supersedes [ADR 0001](docs/ADRs/0001-no-monorepo-tooling.md).
- Root `.dockerignore` for workspace-context Docker builds.
- `pnpm.packageExtensions` in root `package.json` to inject `zod` as a peer of `@hookform/resolvers` (resolver only declares this in its subpath manifest, which pnpm doesn't honor).

### Changed

- Root `package.json` pins `packageManager: "pnpm@10.30.0"` (consolidates per-app pins).
- `Frontend/vercel.json` `installCommand` → `cd .. && pnpm install --frozen-lockfile --filter ./Frontend...`. Vercel dashboard toggle **Include source files outside of the Root Directory** must be ON.
- `render.yaml` switched to `runtime: docker` with explicit `dockerfilePath: ./Backend/Dockerfile`, `dockerContext: .`, and a `buildFilter` so Frontend-only pushes skip the API redeploy.
- `Backend/Dockerfile` rewritten to expect the repo root as build context: copies workspace manifests, installs `--filter ./Backend...`, builds, then re-installs `--prod --ignore-scripts` in the runtime stage (skips the root `prepare: husky` lifecycle).

### Removed

- `Frontend/pnpm-lock.yaml` and `Backend/pnpm-lock.yaml` (single root lockfile is now authoritative).
