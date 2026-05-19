## Summary

<!-- 1-3 bullet points covering what changed and why. -->

## Linked issues

<!-- e.g. Closes #123, Refs #456. Remove the line if none. -->

## Type of change

- [ ] feat — new feature
- [ ] fix — bug fix
- [ ] chore — tooling / refactor
- [ ] docs — documentation only
- [ ] perf — performance
- [ ] test — tests only

## Test plan

<!-- Concrete steps a reviewer can run to verify. Include curl snippets or UI flow if useful. -->

- [ ] `pnpm lint` passes in the affected workspace(s)
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes
- [ ] Manual smoke test described below

## Screenshots / recordings

<!-- For UI changes. Drag-and-drop into this textarea. Remove the heading if N/A. -->

## Checklist

- [ ] Commits follow [Conventional Commits](https://www.conventionalcommits.org/)
- [ ] Touched docs (`README.md`, `docs/API.md`, `ARCHITECTURE.md`, ADRs) reflect the change
- [ ] Every async surface I touched has loading / empty / error states
- [ ] No new `: any` without an inline justification
- [ ] No hardcoded URLs or secrets — values read from env
