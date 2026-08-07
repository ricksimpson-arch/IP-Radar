# Market Analytica — Marketing Site & Lead Engine

Production site for marketanalytica.com: public marketing pages, an
interactive project planner, and a build-application pipeline.

- **Spec:** [`SPEC.md`](./SPEC.md) (authoritative, milestone-ordered)
- **Agent rules:** [`CLAUDE.md`](./CLAUDE.md)

## Stack

Next.js 15 (App Router, Server Actions) · TypeScript strict · Tailwind CSS v4 ·
Zod at every server boundary · React Hook Form · Vitest.

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm verify     # typecheck + lint + unit tests
pnpm build      # production build
```

## Status

Implemented: foundation (M0), design system & shell (M1), marketing pages
(M2, with typed static content standing in for the CMS), planner with pure
rules engine (M4), application form with per-step validation and lead
scoring (part of M5).

Pending external services (see `CLAUDE.md` → Current build status and
`.env.example`): Postgres/Drizzle persistence, Sanity CMS, Resend email,
R2 uploads, admin console auth, Turnstile/rate limiting, PostHog/Sentry.
