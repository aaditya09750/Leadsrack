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
