# Security Policy

## Supported Versions

This project is pre-1.0. Only the `main` branch receives security fixes.

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| < main  | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not** open a public GitHub issue.

Email the maintainers at **aadigunjal0975@gmail.com** with:

- A description of the vulnerability and its impact.
- Steps to reproduce, including affected versions and environment.
- Any proof-of-concept code (if applicable).

You will receive an acknowledgement within 3 business days. Once the issue is confirmed,
a fix will be prepared on a private branch. The reporter will be credited in the release
notes unless they request anonymity.

## Scope

In scope:

- Authentication and authorization flows in the API.
- Input validation at all HTTP boundaries.
- Secret handling (env vars, JWT signing keys, database credentials).
- Dependencies with known CVEs.

Out of scope:

- Vulnerabilities that require physical access to a developer's machine.
- Issues in third-party services we depend on (MongoDB Atlas, Render, Netlify) —
  report those to the vendor directly.
- Social engineering.

## Known Trade-offs

The current implementation accepts these trade-offs, documented in [ADRs](docs/ADRs/):

- JWT is stored in `localStorage` on the client (ADR 0005). This is vulnerable to XSS;
  Content Security Policy and httpOnly cookies are on the roadmap.
- `0.0.0.0/0` allowlist on MongoDB Atlas during development. Lock to known IPs in
  production deployments.
