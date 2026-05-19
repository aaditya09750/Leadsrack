# ADR 0002 — Custom JWT over a third-party auth provider

- **Status**: Accepted
- **Date**: 2026-05-19

## Context

The Smart Leads Dashboard assignment requires "JWT-based authentication" with "User
Registration, User Login, Protected Routes, Password Hashing using bcrypt, Auth Middleware."
Available alternatives included Clerk, Auth0, NextAuth/Auth.js, better-auth, and Supabase Auth.

## Decision

Implement JWT manually using `jsonwebtoken` + `bcryptjs`.

- Tokens signed with HS256 + the `JWT_SECRET` env var.
- 7-day default lifetime (`JWT_EXPIRES_IN`, overridable).
- Bcrypt with cost factor `BCRYPT_ROUNDS` (default 10).
- Two middlewares: [`requireAuth`](../../Backend/src/middleware/auth.ts) decodes the bearer
  token and hydrates `req.user`; [`requireRole(...roles)`](../../Backend/src/middleware/requireRole.ts)
  is a factory layered on top.

## Consequences

**Positive**

- Satisfies the assignment's explicit JWT requirement — assignment evaluators can read the
  full auth path in one Backend module.
- No external service dependency. Reviewers don't need a Clerk/Auth0 dev account.
- Audit surface is tiny: token issuance, verification, and role checking are each one file.

**Negative**

- No built-in account recovery, email verification, MFA, or session management. These would
  be free with a managed provider. They're in the [roadmap](../../README.md#roadmap).
- Token revocation requires manual server-side blocklisting (currently not implemented; tokens
  simply expire).

## Evolution

If session management or account recovery becomes a requirement, swap to better-auth
(self-hosted) or Auth.js. The migration surface is contained to:

- `Backend/src/middleware/auth.ts`
- `Backend/src/services/auth.ts`
- `Frontend/src/store/authStore.ts`
- The auth pages.
