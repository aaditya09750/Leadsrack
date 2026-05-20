# Contributing to Leadsrack

Thanks for taking the time to contribute. This guide is short on purpose — read it once, refer back as needed.

## Development setup

Prerequisites:

- Node.js 22 (use `nvm use` if you have nvm; the version is pinned in `.nvmrc`).
- pnpm 9 or later (`npm install -g pnpm`).
- Docker Desktop (optional, for the compose stack).

From the repo root:

```bash
pnpm install                  # one install — pnpm workspaces handle Frontend + Backend together
```

The single root `pnpm-lock.yaml` governs both apps. Per-app installs (`cd Backend && pnpm install`) still work but resolve to the same root lockfile.

See `README.md` for the full quick-start including database setup.

## Branch naming

- `feat/<short-description>` for new features
- `fix/<short-description>` for bug fixes
- `chore/<short-description>` for tooling, refactors, dependency bumps
- `docs/<short-description>` for documentation-only changes

## Commit messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/). The `commit-msg`
hook will reject commits that don't conform.

Format: `<type>(<optional-scope>): <subject>`

Examples:

```
feat(api): add owner-or-admin guard to lead deletion
fix(web): debounce search input by 400ms before firing query
docs: document RBAC trade-off in ADR 0003
chore: bump express from 5.0.0 to 5.0.1
```

Allowed `<type>` values: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`.

## Pull request checklist

Before opening a PR:

- [ ] Code passes `pnpm --filter ./<workspace> lint` and `pnpm --filter ./<workspace> typecheck` in each affected workspace.
- [ ] Build succeeds (`pnpm --filter ./<workspace> build`).
- [ ] Loading, empty, and error states exist for every async surface touched.
- [ ] No `: any` without an inline justification comment.
- [ ] No hardcoded URLs or secrets — everything reads from env.
- [ ] Touched docs (`README.md`, `docs/API.md`, ADRs) reflect the change.
- [ ] Commits follow Conventional Commits.

## Code style

- Prettier-formatted (runs on `pre-commit`).
- ESLint flat config per workspace; no warnings allowed.
- One responsibility per file. If a file crosses ~300 lines, consider splitting.
- Comments only when the _why_ is non-obvious. Don't describe _what_ the code does.
- Imports use aliased paths configured in `tsconfig.json`. Avoid `../../../..` chains.

## Where things live

| Area                   | Path                        |
| ---------------------- | --------------------------- |
| API source             | `Backend/src/`              |
| API schemas (Zod)      | `Backend/src/schemas/`      |
| API routes             | `Backend/src/routes/`       |
| Web source             | `Frontend/src/`             |
| Shared mirrored types  | `Frontend/src/types/api.ts` |
| Architecture decisions | `docs/ADRs/`                |

## Good first issues

Look for the `good first issue` label on GitHub. Common starting points:

- Add a missing loading/empty/error state.
- Tighten a Zod schema to reject edge inputs.
- Add an ADR for a decision discovered while implementing a feature.

## Security issues

See [`SECURITY.md`](SECURITY.md) for private disclosure instructions. **Do not** open public
issues for security problems.
