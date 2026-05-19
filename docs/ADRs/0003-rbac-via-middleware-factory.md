# ADR 0003 — RBAC via a middleware factory plus a service-layer ownership check

- **Status**: Accepted
- **Date**: 2026-05-19

## Context

Two roles, `admin` and `sales`. Admins have global read/write on leads; sales users only see
and act on leads they created. The assignment specifies "Role-Based Access Control" as a
mandatory feature.

Alternatives considered:

1. **Middleware only** — `requireRole('admin')` on admin-only routes. Insufficient for
   per-resource ownership where the same route serves both roles with different filtering.
2. **Service-layer only** — every service function takes `viewer` and decides. Routes have no
   role hint at all; readers can't tell at a glance who's allowed where.
3. **Both** — middleware for coarse-grained role gating, service for ownership.

## Decision

Adopt option 3.

- `requireAuth` runs first on every protected route.
- `requireRole('admin')` is available as a factory but is **not** currently mounted on any
  lead route — admin/sales both call the same handlers and the **service layer** filters by
  ownership.
- For per-resource access, [`getLead(id, viewer)`](../../Backend/src/services/leads.ts) throws
  `forbidden()` if `viewer.role !== 'admin'` and `String(lead.createdBy) !== viewer.id`.
  `updateLead` and `deleteLead` call `getLead` first to share that check.
- For list and CSV-export queries, the [filter builder](../../Backend/src/services/leads.ts)
  inserts `createdBy = viewer.id` automatically when the viewer isn't admin.

## Consequences

**Positive**

- Routers stay declarative. `router.get('/:id', validate(...), controller.getOne)` is the
  whole story; ownership lives in the service.
- The pattern composes — if admin-only routes (e.g. user management) appear later,
  `requireRole('admin')` is already there, ready to mount.
- One enforcement point per concern: middleware for "are you allowed to be here at all,"
  service for "are you allowed to touch this row."

**Negative**

- Service layer must always receive `viewer`. A new endpoint that forgets to pass it would
  silently widen access. Caught by code review and by the typed `Viewer` parameter on every
  service signature.
- A new role tier (e.g. `manager`) would need both middleware and service updates.

## Evolution

If access patterns grow more granular (per-team, per-region), move the ownership predicate
into a Mongo query stage rather than an in-process check. The current pattern remains
correct but becomes expensive when admin lists span millions of rows.
