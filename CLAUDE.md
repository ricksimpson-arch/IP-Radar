# Market Analytica — standing rules for the agent

These rules come from SPEC.md §0 and are non-negotiable. Read SPEC.md before
starting any milestone; implement one milestone at a time.

1. TypeScript `strict` is on. No `any`, no `@ts-ignore` without an adjacent
   comment explaining why.
2. Every user input crosses a Zod schema at the server boundary before touching
   the database. Client validation is a convenience, never a control.
3. No secrets in client components. Anything reading `process.env` without a
   `NEXT_PUBLIC_` prefix must live in a server file.
4. No new dependency without adding it to SPEC.md §5 with a one-line
   justification.
5. Every form control has a programmatically associated label. Every
   interactive element has a visible focus state. Every animation respects
   `prefers-reduced-motion`.
6. No placeholder lorem ipsum in committed code — use the copy deck in SPEC.md
   §24 or a clearly marked `TODO(copy):` string.
7. No fabricated client names, logos, metrics, or testimonials. See SPEC.md §14
   (Claims & Legal Guardrails) — this is a hard rule, not a style preference.
8. `pnpm verify` (typecheck + lint + unit + e2e smoke + a11y) must pass before
   any milestone is called done.

## Accent discipline (SPEC.md §7.1)

`--ma-signal` (electric green) may appear in only three roles: the primary CTA,
live data marks in charts/hero, and a single active-state indicator. Never as a
heading color, section background, or decorative underline.

## Current build status

Milestones M0–M2 and M4 are implemented, plus the application form and lead
scoring from M5. The following are seams awaiting external services (see
SPEC.md §23 for the env vars they need):

- `src/lib/db/` — persistence is a logged no-op until Postgres/Drizzle is
  wired (M5). Every write path funnels through `src/lib/db/store.ts`.
- CMS content is authored in `src/lib/data/` as typed constants; Sanity
  replaces these in M3 without changing page components.
- Email, CRM sync, Turnstile, rate limiting, admin auth: M5–M7.
