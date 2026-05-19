# ADR 0005 — JWT in localStorage instead of httpOnly cookie

- **Status**: Accepted (with caveats)
- **Date**: 2026-05-19

## Context

The browser needs to store the JWT between page loads. Two standard options:

1. **httpOnly cookie** — set by the server on login, attached automatically on every same-origin
   request. Inaccessible to JavaScript, so XSS cannot exfiltrate it. Requires CSRF protection
   and a same-origin (or proper CORS-credentials) setup.
2. **`localStorage`** — the SPA reads the token after login and attaches it to the
   `Authorization: Bearer` header via an axios interceptor. Simple, cross-origin friendly, but
   accessible to any script that runs in the page → vulnerable to XSS.

## Decision

`localStorage`, for now.

- Token written by
  [`authStore.setSession`](../../Frontend/src/store/authStore.ts) on successful login.
- Read on every request by the axios interceptor in
  [`Frontend/src/lib/api.ts`](../../Frontend/src/lib/api.ts).
- A 401 from any request triggers `authStore.logout()` → token cleared → user redirected.

## Consequences

**Positive**

- Simplest implementation that satisfies the assignment's "Proper token handling" requirement
  without standing up cookie-based session middleware.
- Cross-origin friendly: the frontend can sit on a different host (Netlify) from the API
  (Render) without dealing with the cookie `SameSite` / `Secure` matrix.
- The auth flow remains entirely client-driven — no server-set cookies means no CSRF surface
  to defend.

**Negative — material**

- **XSS risk**: any script running in the page can read the token. We mitigate by:
  - No third-party scripts in `index.html`.
  - All rendering through React (no `dangerouslySetInnerHTML`).
  - Strict CSP would tighten this further (in the roadmap).
- A leaked token cannot be revoked server-side — it must expire (`JWT_EXPIRES_IN`, default 7d).

## Evolution

For a production deploy, migrate to:

- Short-lived access JWT (5–15 min) kept in JS memory.
- httpOnly + secure + `SameSite=Strict` refresh token cookie.
- CSP header restricting script sources to self.
- A `/auth/refresh` endpoint that rotates the access token using the refresh cookie.

This is non-trivial — it requires server-side refresh storage (or a stateless JTI blacklist),
a cross-origin proxy strategy, and CSRF tokens on state-changing requests. It belongs after
the assignment scope; it is listed in the [README roadmap](../../README.md#roadmap).
