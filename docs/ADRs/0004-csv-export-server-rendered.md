# ADR 0004 — CSV export is server-streamed, not client-serialised

- **Status**: Accepted
- **Date**: 2026-05-19

## Context

The assignment requires CSV export of leads. Two implementations were considered:

1. **Client serialisation** — the browser fetches the same `GET /api/leads` endpoint,
   collates pages, and builds the CSV with `papaparse` or `json2csv`. No new endpoint needed.
2. **Server streaming** — a new `GET /api/leads/export.csv` endpoint pipes a Mongoose
   `find().lean().cursor()` through a `Transform` from `@json2csv/node` directly into the
   response.

## Decision

Option 2 — server-streamed.

- Endpoint: [`GET /api/leads/export.csv`](../../Backend/src/routes/leads.ts).
- Accepts the same query parameters as `GET /api/leads` (status, source, search, sort).
- RBAC scope identical: admin gets all, sales gets only own.
- Implementation:
  [`pipeline(cursor, json2csvTransform, res)`](../../Backend/src/services/csv.ts) — memory
  flat regardless of result-set size.

## Consequences

**Positive**

- Constant memory on the server even for very large exports.
- Single network request from the client — no N pagination round-trips.
- Filename and `Content-Disposition` controlled centrally on the server.
- The endpoint reuses the existing filter builder, so filter behaviour cannot drift between
  the list view and the export.

**Negative**

- One additional endpoint to document and version.
- CSV-format options (delimiter, quote style, field selection) live server-side; per-user
  customisation would need request parameters.

## Evolution

If exports get heavy enough to time out a typical reverse-proxy 60 s budget, move the work to
a queue (BullMQ or Inngest) that produces a signed S3/R2 URL emailed to the user. The current
endpoint becomes the enqueue trigger.
