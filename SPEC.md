# Market Analytica — Marketing Site & Lead Engine

## Claude Code Build Specification v1.0

**Owner:** Rick Simpson
**Status:** Developer-ready
**Target:** Production launch of marketanalytica.com (public site + planner + application pipeline + admin console)

> This is the authoritative build spec, committed verbatim from the owner's
> brief. The standing rules in §0 are mirrored in `CLAUDE.md` at the repo root.

---

## 0. How to use this spec with Claude Code

This document is written to be executed in **milestone order** (Section 22). Do not ask Claude Code to "build the site" in one pass.

**Recommended prompting pattern per milestone:**

```
Read SPEC.md. Implement Milestone M3 only.
Constraints: do not modify files outside the scope listed in M3.
When done: run `pnpm verify` and paste the output.
Then list every acceptance criterion in M3 and mark PASS/FAIL with evidence.
Stop. Do not begin M4.
```

**Standing rules for the agent (put these in `CLAUDE.md` at repo root):**

1. TypeScript `strict` is on. No `any`, no `@ts-ignore` without an adjacent comment explaining why.
2. Every user input crosses a Zod schema at the server boundary before touching the database. Client validation is a convenience, never a control.
3. No secrets in client components. Anything reading `process.env` without a `NEXT_PUBLIC_` prefix must live in a server file.
4. No new dependency without adding it to Section 5 with a one-line justification.
5. Every form control has a programmatically associated label. Every interactive element has a visible focus state. Every animation respects `prefers-reduced-motion`.
6. No placeholder lorem ipsum in committed code — use the copy deck in Section 24 or a clearly marked `TODO(copy):` string.
7. No fabricated client names, logos, metrics, or testimonials. See Section 14 (Claims & Legal Guardrails) — this is a hard rule, not a style preference.
8. `pnpm verify` (typecheck + lint + unit + e2e smoke + a11y) must pass before any milestone is called done.

---

## 1. Product summary

Market Analytica builds **custom market-research, forecasting, and decision-intelligence platforms**. The website has one commercial job: convert a qualified operator or executive into a submitted, well-specified build application.

The site is itself a proof of the product. A visitor should leave thinking *"these people build analytical systems"* — not *"these people bought a template and added a bar chart."* The interactive planner (Section 9) is the mechanism that makes that argument, because it is a working miniature of what Market Analytica sells: structured inputs → a transparent model → a decision-ready output.

**Hero headline:** Turn market data into a decision system.
**Supporting copy:** Market Analytica designs custom platforms that help companies rank opportunities, forecast demand, evaluate risk, and turn scattered research into clear business decisions.
**Primary CTA:** Apply for a Custom Build
**Secondary CTA:** Explore Our Work

---

## 2. Goals, non-goals, success metrics

### 2.1 Goals

- G1 — Produce **qualified** applications, not raw volume. A qualified application names a real decision, has budget signal, and has at least one identified data source.
- G2 — Pre-qualify and pre-brief before a human ever gets on a call. The planner + application should replace the first 30 minutes of a discovery call.
- G3 — Demonstrate analytical credibility through the LootSignal case study and the methodology pages.
- G4 — Give the operator (Rick) a single admin surface to triage, score, and export leads without touching the database.

### 2.2 Non-goals for v1

- No user accounts for prospects (draft resume is handled by signed magic link, not passwords).
- No payments, invoicing, or client portal. Delivered work lives outside this site.
- No multi-language. Copy is authored English-only; the i18n seam is left in place (Section 7.6) but unused.
- No live LootSignal data feed into the marketing site. Case-study numbers are CMS-authored, versioned, and dated.

### 2.3 Success metrics (each must map to a tracked event in Section 17)

| Metric | Definition | Instrumentation |
|---|---|---|
| Application conversion rate | `application_submitted` ÷ unique sessions | PostHog funnel |
| Qualified applications | submissions with lead score ≥ 60 (Section 9.6) | DB field `lead_score` |
| Form completion rate | `application_submitted` ÷ `application_started` | Step-level funnel |
| Step drop-off | exits per step index | `application_step_completed` |
| Planner→apply handoff | `application_started` with `planner_session_id` present ÷ `planner_completed` | DB join |
| Case-study engagement | median scroll depth + time on `/work/lootsignal` | `case_study_scroll_75` |
| Consultation bookings | `booking_confirmed` webhook from scheduler | Cal.com webhook |
| Returning company visitors | distinct email domains with ≥2 sessions | server-side attribution |
| Traffic → qualified lead | qualified applications ÷ sessions, by source | UTM capture (Section 17.3) |

---

## 3. Audiences and primary journeys

### 3.1 Segments (drive planner presets and admin routing)

Entertainment & media · ecommerce & merchandise · consumer-product brands · licensing & IP teams · private equity & investment · corporate strategy / innovation / insights teams.

### 3.2 Personas

- **The Operator** (VP Merchandising, Head of Licensing). Has a specific recurring decision and a spreadsheet that has outgrown itself. Wants to see the product working. Entry point: LootSignal case study.
- **The Analyst-Buyer** (Director of Insights, Strategy Lead). Will interrogate methodology before anything else. Entry point: `/method`. Will bounce if formulas are hand-waved.
- **The Investor** (PE associate/principal). Diligence-oriented, timeline-sensitive, security-sensitive. Entry point: `/security` and `/work`.

### 3.3 Critical paths (must be Playwright-covered)

1. Home → LootSignal case study → Build a System Like This → application → submit → confirmation → booking.
2. Home → Planner → generated system outline → prefilled application → submit.
3. Any page → sticky CTA → application → abandon at step 3 → resume via emailed link → submit.
4. Admin → login → filter to qualified → open application → download attachment → change status → export CSV.

---

## 4. Information architecture

```
/                          Home
/capabilities              Six capability areas, expanded
/capabilities/[slug]       One page per capability (CMS)
/work                      Case study index
/work/lootsignal           Flagship case study
/method                    How it works + trust & methodology
/method/standards          Analytical standards (formulas, confidence, freshness)
/insights                  Writing index (CMS)
/insights/[slug]           Article
/engagements               Engagement models, scope bands, indicative timelines
/planner                   Interactive project planner
/planner/[token]           Saved/shared planner result
/apply                     Multi-step application
/apply/resume/[token]      Resume a saved draft (signed, expiring)
/apply/success             Confirmation + scheduling + what happens next
/about                     Team, credentials, point of view
/security                  Data handling, hosting, retention, DPA request
/contact                   Low-friction alternative to applying
/legal/privacy  /legal/terms  /legal/cookies
/admin                     Application pipeline (auth required)
/admin/applications/[id]
/admin/planner-sessions
/admin/settings
```

**Additions to the original brief, and why:**

- `/engagements` — buyers who cannot see a budget range anywhere self-disqualify or submit garbage budget answers. Publishing scope bands (not fixed prices) raises application quality.
- `/security` — PE and enterprise buyers ask about data handling before they ask about price. Answering it on-page removes a stall.
- `/insights` — the only durable non-paid acquisition channel for this category, and it feeds retargeting/attribution.
- `/method/standards` — the analyst-buyer's landing page; makes the trust principles in the brief concrete and linkable.
- `/apply/resume/[token]` — a 10-field application submitted in one sitting is a different (worse) application than one completed over two days.
- `/contact` — not everyone is ready to apply; without this they leave with no identity captured.

---

## 5. Technology stack

| Layer | Choice | Justification |
|---|---|---|
| Framework | Next.js 15 (App Router, RSC, Server Actions) | Route-level caching, server-first forms, Vercel deploy path |
| Language | TypeScript 5.x, `strict: true` | Non-negotiable per brief |
| Styling | Tailwind CSS v4 + CSS custom properties | Tokens live in CSS vars so CMS/theming stays possible |
| UI primitives | shadcn/ui (Radix) | Accessible primitives; owned source, not a black-box dep |
| Motion | Motion (framer-motion) for orchestration; CSS for ambient | One motion library only |
| Charts | Recharts for static case-study visuals; hand-built SVG/Canvas for hero | Avoids shipping a heavy chart lib for decorative work |
| Forms | React Hook Form + Zod resolver | Per-step schemas, shared client/server |
| Database | Postgres (Neon serverless) | Relational, cheap, branchable for previews |
| ORM | Drizzle ORM + drizzle-kit migrations | Typed schema is the source of truth in Section 11 |
| File storage | S3-compatible (Cloudflare R2) with presigned PUT | Files never transit the Next server |
| Auth (admin only) | Auth.js v5, email magic link + allowlist | No public accounts needed |
| Email | Resend + React Email templates | Transactional + internal alerts |
| Scheduling | Cal.com embed + webhook | Booking metric requires a webhook, not a link |
| CMS | Sanity (hosted, structured content) | Case studies and capabilities must be editable without deploy |
| Anti-abuse | Cloudflare Turnstile + Upstash Redis rate limit + honeypot | Public forms with file upload will be attacked |
| Analytics | PostHog (EU region) + Vercel Analytics | Funnels, session-level attribution, consent-gated |
| Errors | Sentry (client + server + edge) | |
| Testing | Vitest, Playwright, axe-core, Lighthouse CI | Section 20 |
| CI/CD | GitHub Actions → Vercel | Preview per PR with seeded DB branch |
| Package manager | pnpm | |

**Explicitly rejected:** no Redux (server state + URL state suffice), no separate REST backend (Route Handlers + Server Actions), no headless-UI kitchen sink, no animation-library stacking.

**Dependencies added so far (rule 4 ledger):**

- `next` / `react` / `react-dom` — framework (above).
- `typescript`, `@types/*` — language (above).
- `tailwindcss` / `@tailwindcss/postcss` / `postcss` — styling (above).
- `zod` — validation at every boundary (above).
- `react-hook-form` / `@hookform/resolvers` — multi-step form state + per-step Zod resolution (above).
- `nanoid` — planner session/share tokens and idempotency keys (§9.5, §10.2).
- `eslint` / `eslint-config-next` / `@eslint/eslintrc` — lint layer of `pnpm verify`.
- `vitest` — unit test layer of `pnpm verify`.
- `server-only` — build-time guard that server modules (db, env) never reach client bundles (rule 3).

---

## 6. Repository structure

Single Next.js application. Turborepo is unnecessary at this size; the seam is left for a future `packages/` split.

```
market-analytica/
├─ CLAUDE.md                      # standing rules (Section 0)
├─ SPEC.md                        # this document
├─ src/
│  ├─ app/
│  │  ├─ (marketing)/             # public pages, shared marketing layout
│  │  ├─ (funnel)/planner/ , apply/
│  │  ├─ admin/                   # protected layout
│  │  ├─ api/                     # route handlers (Section 12)
│  │  ├─ opengraph-image.tsx      # dynamic OG
│  │  ├─ sitemap.ts  robots.ts
│  ├─ components/
│  │  ├─ ui/                      # shadcn primitives
│  │  ├─ marketing/               # Hero, CapabilityGrid, CaseStudy blocks
│  │  ├─ planner/                 # steps, rules UI, outline renderer
│  │  ├─ apply/                   # step components, uploader, progress
│  │  ├─ admin/                   # table, filters, detail panes
│  │  └─ viz/                     # HeroDashboard, ScoreBars, ScenarioFan
│  ├─ lib/
│  │  ├─ db/                      # drizzle schema, client, migrations
│  │  ├─ planner/                 # rules engine (pure, unit-tested)
│  │  ├─ scoring/                 # lead scoring (pure, unit-tested)
│  │  ├─ email/                   # Resend + React Email
│  │  ├─ storage/                 # presign, virus-scan hook
│  │  ├─ analytics/               # typed event emitter (Section 17)
│  │  ├─ cms/                     # Sanity client + typed queries
│  │  ├─ validation/              # Zod schemas shared client+server
│  │  └─ security/                # rate limit, turnstile, csp
│  ├─ content/                    # MDX fallbacks for legal pages
│  └─ styles/tokens.css
├─ sanity/                        # studio + schemas (Section 21)
├─ tests/{unit,e2e,a11y}/
├─ scripts/seed.ts
└─ .github/workflows/ci.yml
```

`pnpm verify` = `typecheck && lint && test:unit && test:e2e:smoke && test:a11y`.

---

## 7. Design system

The brief pins the direction: dark navy/charcoal, white, electric-green accent, generous spacing, real dashboard visuals. Follow it — with the discipline below, because "dark background + acid green" is exactly the palette that reads as generic when the accent is sprayed everywhere.

### 7.1 Color tokens (`src/styles/tokens.css`)

```css
:root {
  --ma-ink-900:  #070B14;   /* page base, near-black navy */
  --ma-ink-800:  #0C1322;   /* section base */
  --ma-ink-700:  #131C2E;   /* card surface */
  --ma-ink-600:  #1D2941;   /* raised surface, table stripe */
  --ma-line:     #263349;   /* hairlines, grid, dividers */
  --ma-paper:    #F4F7FB;   /* primary text on dark */
  --ma-mute:     #9AA9C0;   /* secondary text (AA on ink-900) */
  --ma-faint:    #63728A;   /* tertiary/labels only, never body */
  --ma-signal:   #35F0A0;   /* electric green — DATA + PRIMARY ACTION ONLY */
  --ma-signal-d: #12B978;   /* pressed/hover, and green text on light bg */
  --ma-cyan:     #4CC9F0;   /* second data series */
  --ma-amber:    #F2B441;   /* confidence: medium / caution */
  --ma-coral:    #FF6B6B;   /* confidence: low / risk / destructive */
}
```

**Accent discipline (enforced in review):** `--ma-signal` may appear in only three roles — (1) the primary CTA, (2) live data marks in charts and the hero, (3) a single active-state indicator. It never appears as a heading color, never as a section background, never as decorative underline. Target: no more than ~5% of any viewport's pixels.

**Contrast:** `--ma-signal` on `--ma-ink-900` is a large-text/graphic pass, not a body-text pass. Primary CTA is `--ma-ink-900` text on a `--ma-signal` fill. Green text on dark is permitted only at ≥18.66px bold, and never for paragraphs.

### 7.2 Typography

Two families, deliberately paired, both variable and self-hosted via `next/font/local`:

- **Display / headings:** *Söhne Breit* or **Instrument Sans** (open-source fallback) — tight, slightly condensed grotesque. Weights 500/600. Headline tracking `-0.02em`.
- **Body / UI:** **Inter Variable**, weights 400/500. `font-feature-settings: "cv05","ss01","tnum"`.
- **Data / mono:** **JetBrains Mono** for figures, model outputs, formulas, table numerics, and confidence chips. Tabular numerals everywhere a number can change.

The mono-for-data rule is the typographic signature: every number that comes out of a model is set in mono, so the reader learns to recognize model output on sight. Prose numbers stay in Inter.

Type scale (clamp-based, fluid): display `clamp(2.75rem, 6vw, 5rem)` / h2 `clamp(2rem, 3.5vw, 3rem)` / h3 `1.5rem` / body `1.0625rem` with `line-height: 1.65` / label `0.8125rem` uppercase `0.08em`.

### 7.3 Layout and structure

- 12-column grid, `max-width: 1240px`, gutter 24px mobile / 32px desktop.
- Vertical rhythm: section padding `clamp(5rem, 10vw, 8rem)`. No section is denser than its neighbors by more than one step.
- Radii: `--r-sm: 6px`, `--r-md: 10px`, `--r-lg: 16px`. No pill buttons; this is an analytics tool, not a consumer app.
- Elevation via 1px `--ma-line` borders and subtle inner glow, not drop shadows. Dark UI reads shadows as mud.
- **Structural device:** section eyebrows carry a real datum, not decoration — e.g. `CAPABILITIES · 6 AREAS`, `CASE STUDY · 52 FRANCHISES SCORED`. Numbered markers (01/02/03) are used **only** on `/method`'s four-phase process, because that content genuinely is a sequence.

### 7.4 Motion

- Ambient: hero dashboard animation (Section 8.1, Block 1) on a `requestAnimationFrame` loop that **pauses when off-screen** (IntersectionObserver) and when `document.hidden`.
- Entrance: one orchestrated stagger per section, 320ms, `cubic-bezier(0.22, 1, 0.36, 1)`, translate ≤ 12px. No scroll-jacking, no parallax on text.
- Micro: 120ms state transitions on interactive elements only.
- `@media (prefers-reduced-motion: reduce)` — all transforms → opacity-only or none; hero animation renders a static final frame.

### 7.5 Component inventory (build in this order)

`Button` (primary/secondary/ghost/destructive) · `Eyebrow` · `SectionHeader` · `Card` · `StatBlock` · `CapabilityCard` · `ProcessStep` · `ConfidenceChip` (high/med/low) · `SourceTag` · `MethodologyNote` · `DisclaimerBanner` (Section 14) · `StepProgress` · `FieldGroup` · `FileDropzone` · `ChoiceGrid` · `RangeSelect` · `SystemOutlineCard` · `CTASection` · `StickyApplyBar` · `DataTable` (admin) · `StatusPill` · `EmptyState` · `ErrorState`.

### 7.6 Copy and i18n seam

All user-facing strings live in `src/content/copy.ts` as a typed object keyed by surface (`copy.home.hero.headline`). Not a translation framework — just a single import point so copy edits never require hunting through JSX, and so a future i18n layer has one seam to attach to.

---

## 8. Page specifications

### 8.1 Home (`/`)

**Block 1 — Hero.** Headline, supporting copy, primary CTA (`Apply for a Custom Build` → `/apply`), secondary link (`View LootSignal` → `/work/lootsignal`).
Background: `HeroDashboard` — a purpose-built SVG/Canvas composition, not a stock image and not a generic particle field. It shows a **live scoring pass**: ~14 unlabeled opportunity rows re-sorting themselves as three weight sliders drift, with the leading row's score counting in mono type. It is decorative but truthful — it animates the actual mechanic the company sells. Requirements: ≤40KB, no layout shift, `aria-hidden="true"`, static frame under reduced motion, paused off-screen, and it must never obscure text (max 22% opacity behind the headline column).

**Block 2 — Capabilities.** Six `CapabilityCard`s, each linking to `/capabilities/[slug]`:

| Capability | One-line |
|---|---|
| Market Opportunity Scoring | Rank products, markets, or investments using custom criteria. |
| Forecasting & Scenarios | Model likely outcomes, risks, and future market changes. |
| Competitive Intelligence | Compare competitors, pricing, positioning, and market whitespace. |
| Executive Dashboards | Convert complex research into clear decision-making tools. |
| Data Integration | Combine company data with external research and market signals. |
| Custom Analytics Systems | Build a platform around each client's workflow and decisions. |

**Block 3 — Featured case study teaser.** LootSignal: the business question, three headline figures (set in mono, each with a `SourceTag`), one real dashboard screenshot, CTA `Build a System Like This`.

**Block 4 — How it works.** The four phases, condensed, linking to `/method`.

**Block 5 — Planner entry.** A single live question rendered inline ("What decision are you trying to make?") that, on submit, deep-links into `/planner` with that answer pre-filled. Starting the planner from the homepage is the highest-intent action short of applying; do not bury it behind a nav item.

**Block 6 — Standards strip.** The seven trust principles as compact items linking to `/method/standards`.

**Block 7 — Final CTA.** "Your company has data. We turn it into decisions." + `Apply to build a custom market-intelligence system.`

Also: `StickyApplyBar` appears after 60% scroll on mobile only.

### 8.2 Case study (`/work/lootsignal`)

CMS-driven, but the structure is fixed:

1. **The question the client needed answered** — stated as a decision, not a topic.
2. **Scope** — 52 entertainment franchises; the seven scoring dimensions (demand, fandom, design potential, licensing feasibility, audience fit, pricing power, market whitespace).
3. **Data and research used** — source classes, refresh cadence, and what was *not* available. Every figure carries a `SourceTag` and a `ConfidenceChip`.
4. **The scoring model** — the weighting approach shown as a real, readable formula block plus an interactive weight demo (three sliders that re-rank a 10-row sample). This is the single most persuasive artifact on the site.
5. **Dashboard screenshots** — real captures, `<Image>` with explicit dimensions, lightbox, alt text describing the view's purpose.
6. **Features shipped** — rankings, comparisons, forecasts, benchmarks, methodology docs, data room.
7. **Decisions supported** — bullet list phrased as decisions ("which three franchises to pitch next quarter"), not features.
8. **Limitations & assumptions** — mandatory section. Its presence is the credibility argument.
9. CTA: `Build a System Like This` → `/apply?source=lootsignal`.

**Mandatory:** `DisclaimerBanner` rendered above the fold — the LootSignal non-affiliation language (Section 14.2). Rights-holder names appear only as *subjects of analysis*, never as clients, and never as logos.

### 8.3 Method (`/method`)

Four numbered phases — Discovery, Research & Modeling, Platform Development, Launch & Improvement — each with: what happens, what the client provides, what they receive, typical duration band. Links to `/method/standards` for the seven principles: transparent formulas, traceable sources, confidence scores, data-freshness monitoring, separation of observed vs. modeled values, documented assumptions and limitations, secure handling of client data. Each principle gets a concrete example of how it appears in a delivered system, not just a claim.

### 8.4 Engagements (`/engagements`)

Three scope bands with indicative ranges and what changes between them (e.g. *Focused Model* / *Decision Platform* / *Embedded System*), plus what's included, typical timeline, and what pushes a project up a band. No fixed pricing; ranges only, with a line stating scope is set in discovery.

### 8.5 Security (`/security`)

Hosting and region, encryption at rest/in transit, access control, subprocessors list, retention and deletion policy, NDA/DPA availability, incident contact, and a "request our security summary" action that writes a `contact_request` row.

### 8.6 Supporting pages

`/capabilities/[slug]` (problem → approach → outputs → related case study → CTA), `/work` (index; LootSignal plus placeholder slots that render nothing when empty rather than fake entries), `/insights` + `/insights/[slug]` (MDX/Sanity, reading time, JSON-LD Article), `/about`, `/contact`, legal pages, `not-found.tsx`, `error.tsx`, `global-error.tsx` — error states written per Section 7 copy rules: what happened, what to do next, no apology theater.

---

## 9. Interactive Project Planner (`/planner`)

The planner is a product demo disguised as a lead qualifier. It must feel like a system, not a quiz.

### 9.1 Input schema (6 steps, all persisted per step)

```ts
type PlannerInput = {
  industry: Industry;                    // single select, 6 segments + "other"
  decision: DecisionType;                // single select: rank_opportunities | forecast_demand
                                         // | evaluate_risk | monitor_competitors
                                         // | price_products | prioritize_portfolio | other
  decisionDetail?: string;               // free text, 280 char
  dataSources: DataSource[];             // multi: internal_sales, crm, erp, retail_pos,
                                         // web_analytics, social_listening, third_party_panel,
                                         // licensing_reports, spreadsheets_only, none_yet
  outputs: Output[];                     // multi: ranked_list, score_model, forecast,
                                         // scenario_compare, exec_dashboard, alerts,
                                         // api_feed, data_room
  integrations: Integration[];           // multi: snowflake, bigquery, sheets, shopify,
                                         // salesforce, hubspot, netsuite, sftp, none
  timeline: '6-8wk' | '2-3mo' | '3-6mo' | 'exploring';
  teamSize?: 'solo' | 'small' | 'department' | 'enterprise';
};
```

### 9.2 Rules engine — `src/lib/planner/engine.ts`

**Pure, deterministic, dependency-free, 100% unit-tested.** No network call is required to produce an outline. Structure:

- `ARCHETYPES` — 5 system archetypes: *Opportunity Ranking Engine*, *Demand Forecasting System*, *Competitive Monitoring Platform*, *Portfolio Decision Console*, *Pricing & Margin Model*.
- `selectArchetype(input)` — weighted match on `decision` (primary) and `outputs` (secondary); returns archetype + match confidence.
- `deriveModules(input, archetype)` — returns modules: scoring model, data ingestion layer, forecast engine, scenario comparison, dashboard, alerting, methodology docs, data room, API.
- `deriveDataPlan(input)` — maps selected sources to ingestion methods and flags gaps. If `dataSources` includes `none_yet` or `spreadsheets_only`, the plan **must** include a Discovery/data-assembly phase and say so plainly.
- `deriveEffort(input)` — returns a phase-by-phase week band, never a single number.
- `deriveRisks(input)` — e.g. no data sources + 6-8wk timeline → surfaces a timeline-risk note. The planner must be willing to tell a visitor their timeline is unrealistic; that honesty is the brand.

### 9.3 Output — the System Outline

Rendered as a `SystemOutlineCard` that visually matches an internal deliverable, not a marketing block:

- Recommended archetype + one-paragraph rationale
- Module list with "core" vs "phase 2" split
- Data plan: sources → ingestion → gaps
- Suggested dashboard sections
- Phased timeline bands
- Risks & assumptions
- `Apply for a Custom Build` (prefills the application) · `Email me this outline` · `Copy link`

### 9.4 Optional LLM enrichment (feature-flagged, `PLANNER_LLM_ENABLED`)

Deterministic output renders first and is always complete on its own. If the flag is on, `POST /api/planner/enrich` calls the Anthropic API **server-side** to rewrite the rationale and risk notes in the client's own vocabulary. Constraints: hard 8s timeout, response cached by input hash, output length-capped, rendered into a fixed schema (never raw markdown into the DOM), and any failure silently falls back to the deterministic text. The LLM may reword; it may never invent modules, timelines, or figures.

### 9.5 Persistence & sharing

Each session writes a `planner_sessions` row with a `nanoid` token. `/planner/[token]` renders a read-only outline (no email required to view; email required to receive it). Sessions expire from the index after 180 days but are retained for analytics in anonymized form.

### 9.6 Lead scoring — `src/lib/scoring/leadScore.ts`

Pure function, 0–100, computed on submission and stored on the row. Illustrative weights (tune post-launch, keep in one constants file):

| Signal | Max points |
|---|---|
| Budget range (banded) | 30 |
| Decision clarity (specific decision named + detail length) | 20 |
| Data readiness (count/quality of sources) | 15 |
| Timeline (near-term > exploring) | 10 |
| Company size / segment fit | 10 |
| Business email domain (non-free, matches company) | 10 |
| Completed planner before applying | 5 |

Score bands: ≥75 priority · 60–74 qualified · 40–59 nurture · <40 low. Bands drive admin default filters and internal alert routing, and are advisory only — never shown to the applicant.

---

## 10. Application form (`/apply`)

### 10.1 Steps

1. **You** — full name, company, role, business email (free-provider domains rejected with an inline explanation, not a generic error), phone (optional).
2. **Company** — industry, company size, website, region.
3. **The problem** — business problem (long text, 100-char minimum with a live counter), decisions the system must support (repeatable list, 1–5 entries).
4. **Current state** — existing data sources (multi + other), current tools/software, who uses the output today.
5. **What you want** — desired dashboards/deliverables (multi + free text), integrations required.
6. **Scope** — budget range (banded select incl. "not yet determined"), timeline, data-security requirements (NDA required / DPA required / on-prem or region constraint / none), file upload.
7. **Review & submit** — full summary, edit-any-step links, privacy notice with explicit consent checkbox, Turnstile.

### 10.2 Behaviour

- `StepProgress` with step names, completed states, and keyboard navigation between completed steps.
- Per-step Zod schema; advance is blocked only by that step's errors. Errors are announced via `aria-live="polite"` and focus moves to the first invalid field.
- Autosave: local draft on every change (debounced 500ms) + server draft on step completion. After step 2 (email captured) an email offers a signed resume link, `/apply/resume/[token]`, valid 14 days.
- Prefill from `?planner=<token>`, and from UTM params (hidden fields).
- Submit is a **Server Action**; button enters a pending state and is idempotent via a client-generated `submission_id`.

### 10.3 File upload

Presigned PUT direct to R2. Accept `pdf, csv, xlsx, docx, pptx, png, jpg`. Max 25MB/file, 5 files. Validate extension **and** sniffed MIME server-side, store under `applications/{applicationId}/{uuid}-{sanitizedName}`, strip path characters, never trust the client filename for display without escaping. Objects are private; admin access is via short-lived signed GET only. Queue an async scan hook (`scan_status: pending|clean|flagged`); flagged files are hidden from admin download and raise an alert.

### 10.4 On submit

1. Persist `applications` + `application_files` + `consent_records` in one transaction.
2. Compute and store `lead_score`.
3. Enqueue in `email_outbox`: (a) applicant confirmation with a summary and next steps, (b) internal alert with score, segment, and a deep link to `/admin/applications/[id]`.
4. Enqueue `crm_sync_queue` row (HubSpot contact + deal), processed by a cron route with retry/backoff.
5. Emit `application_submitted` with non-PII properties only.
6. Redirect to `/apply/success` — what happens next with real timing, a Cal.com embed for a 30-minute call, and a link to the LootSignal methodology while they wait.

---

## 11. Data model (Drizzle / Postgres)

```ts
// applications
id                uuid pk
submission_id     text unique                 // client idempotency key
status            enum('draft','submitted','reviewing','qualified',
                       'scheduled','proposal','won','lost','archived') default 'draft'
lead_score        integer
resume_token_hash text                        // sha256, nullable after submit
full_name         text
company           text
role              text
email             text                        // citext, indexed
phone             text
website           text
industry          text
company_size      text
region            text
business_problem  text
decisions         jsonb                       // string[]
current_data      jsonb
current_tools     jsonb
desired_outputs   jsonb
integrations      jsonb
budget_band       text
timeline          text
security_reqs     jsonb
planner_session_id uuid fk -> planner_sessions.id nullable
utm               jsonb                       // source, medium, campaign, term, content, referrer
first_seen_at     timestamptz
submitted_at      timestamptz
assigned_to       uuid fk -> users.id nullable
created_at, updated_at

// application_files
id, application_id fk cascade, storage_key text, original_name text,
mime text, size_bytes int, scan_status enum('pending','clean','flagged'), created_at

// application_notes
id, application_id fk cascade, author_id fk -> users.id, body text, created_at

// planner_sessions
id, token text unique, input jsonb, outline jsonb, archetype text,
email text nullable, converted_application_id uuid nullable,
utm jsonb, created_at, completed_at

// contact_requests
id, name, email, company, message, kind enum('contact','security_summary','other'),
utm jsonb, created_at

// users (admin)
id, email unique, name, role enum('owner','admin','viewer'), last_login_at, created_at

// email_outbox
id, to_email, template text, payload jsonb,
status enum('pending','sent','failed'), attempts int, last_error text,
scheduled_for timestamptz, sent_at, created_at

// crm_sync_queue
id, application_id fk, provider text default 'hubspot',
status enum('pending','synced','failed'), attempts int, last_error text,
external_id text, created_at, synced_at

// consent_records
id, email nullable, anon_id text, consent_type enum('privacy','marketing','cookies'),
granted boolean, policy_version text, ip_hash text, user_agent text, created_at

// audit_log
id, actor_id fk -> users.id, action text, entity text, entity_id uuid,
diff jsonb, ip_hash text, created_at
```

Indexes: `applications(status, lead_score desc)`, `applications(submitted_at desc)`, `applications(email)`, `planner_sessions(token)`, `email_outbox(status, scheduled_for)`, `crm_sync_queue(status)`.

`scripts/seed.ts` generates 25 realistic applications across all statuses and score bands so admin work is never developed against an empty table.

---

## 12. API contract

All routes validate with Zod, return `{ ok: true, data }` or `{ ok: false, error: { code, message, fields? } }`, and never leak stack traces. Rate limits are per-IP + per-session via Upstash.

| Route | Method | Auth | Limit | Purpose |
|---|---|---|---|---|
| `/api/planner/session` | POST | public | 20/hr | Create/update planner session, return token |
| `/api/planner/enrich` | POST | public + Turnstile | 10/hr | Optional LLM rationale (flagged) |
| `/api/planner/email` | POST | public + Turnstile | 5/hr | Email outline to visitor |
| `/api/apply/draft` | POST | public | 60/hr | Upsert draft by submission_id |
| `/api/apply/resume` | POST | signed token | 10/hr | Exchange token for draft |
| `/api/apply/upload-url` | POST | public + Turnstile | 20/hr | Presigned PUT |
| `/api/apply/submit` | POST (Server Action) | public + Turnstile | 5/hr | Final submit |
| `/api/contact` | POST | public + Turnstile | 5/hr | Contact / security summary |
| `/api/webhooks/calcom` | POST | HMAC signature | — | Booking confirmed → status + event |
| `/api/webhooks/scan` | POST | shared secret | — | File scan result |
| `/api/cron/outbox` | GET | `CRON_SECRET` | — | Send queued email (1/min) |
| `/api/cron/crm-sync` | GET | `CRON_SECRET` | — | Drain CRM queue |
| `/api/cron/retention` | GET | `CRON_SECRET` | — | Purge per Section 15.4 |
| `/api/admin/applications` | GET | session | — | List/filter/sort/paginate |
| `/api/admin/applications/[id]` | PATCH | session | — | Status, assignment, notes |
| `/api/admin/applications/export` | GET | session (admin+) | 10/hr | CSV export, audit-logged |
| `/api/admin/files/[id]/url` | GET | session | 60/hr | 5-min signed GET |
| `/api/privacy/delete` | POST | verified email link | 3/day | GDPR/CCPA erasure |

---

## 13. Admin console (`/admin`)

- **Auth:** Auth.js magic link restricted to an `ADMIN_ALLOWLIST` env allowlist; roles `owner|admin|viewer`. Middleware protects `/admin/*` and all `/api/admin/*`. Sessions 8h, rolling.
- **Pipeline view:** `DataTable` with columns — company, contact, segment, score, budget band, timeline, status, submitted, assignee. Server-side pagination, sorting, and filtering; filter state lives in the URL so views are shareable. Saved views: *New*, *Priority (≥75)*, *Qualified*, *Awaiting call*, *Stale >7 days*.
- **Detail view:** full submission grouped by step, planner outline (if any) rendered inline, attachments with signed download, status pipeline control, assignee, internal notes with author + timestamp, activity timeline from `audit_log`, and a one-click "copy discovery brief" that formats the submission as a call-prep summary.
- **Planner sessions view:** completed outlines that never converted — the highest-value retargeting list.
- **Export:** CSV of the current filtered view; every export writes an `audit_log` row including row count.
- **Settings:** notification recipients, lead-score thresholds, feature flags, CRM connection status, email outbox health (pending/failed counts with a retry action).

---

## 14. Claims, credibility, and legal guardrails

This section is a build constraint, not a disclaimer. Violating it is a failing build.

### 14.1 Client and rights-holder naming

- **No company may be described or implied as a Market Analytica client without written permission on file.** This explicitly includes Sony. Until permission exists, LootSignal is presented as an internally-built research system, and the underlying franchises are described as *analysis subjects*.
- No third-party logos, wordmarks, or character art anywhere in the build — not in the case study, not in a "trusted by" strip, not as favicon-adjacent decoration.
- No fabricated testimonials, headshots, award badges, or client counts. If a credibility slot has no true content, the component must render nothing rather than a placeholder.
- Franchise names in the case study appear as plain text in data tables and prose only.

### 14.2 Required disclaimer component

`<DisclaimerBanner variant="ip" />` renders above the fold on `/work/lootsignal` and in the footer of any page displaying franchise-level analysis:

> LootSignal is an independent research and analysis system. Franchise and brand names appear as subjects of market analysis. Their inclusion does not imply affiliation with, endorsement by, or licensing rights from any rights holder.

The copy string lives in `copy.legal.ipDisclaimer` and is unit-tested for presence on those routes.

### 14.3 Figure integrity

Every published number carries `sourceType` (`observed | modeled | estimated`), `asOf` date, and a confidence level. The CMS schema makes these fields **required** on any stat block, so a number physically cannot ship without provenance. This is the on-site expression of the "separation of observed and modeled information" principle — practice it publicly, then it is credible when described as a service.

### 14.4 Marketing claim rules

No superlatives without a defined basis. No accuracy percentages unless backtested and dated. Forecast language always states the horizon and the assumption set. "Custom" never implies bespoke ML where the delivered system uses deterministic scoring.

---

## 15. Security, privacy, and data handling

### 15.1 Application security

- Strict CSP via `next.config` headers with per-request nonce; no `unsafe-inline` scripts. Also: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` denying camera/mic/geolocation, `X-Frame-Options: DENY` (except the Cal.com embed route, which uses `frame-src` allowlisting instead).
- Server Actions and all mutating routes are origin-checked; admin mutations additionally require a same-site session cookie (`SameSite=Lax`, `Secure`, `HttpOnly`).
- Rate limiting on every public write endpoint (Section 12) plus Turnstile on submit paths and a honeypot field that silently drops.
- Parameterized queries only (Drizzle). No dynamic SQL string construction anywhere.
- Uploads: server-side MIME sniffing, extension allowlist, size caps, private bucket, short-lived signed GET, async scan gate before admin download.
- Dependency and secret scanning in CI (`pnpm audit`, Gitleaks). Renovate for patch updates.

### 15.2 Data minimization

Collect only what the application requires. No IP addresses stored in plaintext — hash with a rotating salt where needed for abuse control. Analytics events carry no PII: no email, no company name, no free-text problem statements. Session replay is disabled on `/apply/*` and `/admin/*`, unconditionally.

### 15.3 Consent

Cookie banner with granular categories (necessary / analytics / marketing). **Analytics and marketing scripts do not load until consent is granted**; PostHog initializes in a consent-gated wrapper. Every consent decision writes a `consent_records` row with the policy version. A persistent footer link reopens preferences.

### 15.4 Retention and erasure

| Data | Retention |
|---|---|
| Submitted applications | 36 months from last activity |
| Uploaded files | 12 months, then purged (metadata retained) |
| Abandoned drafts | 90 days |
| Planner sessions | 180 days identified, then anonymized |
| Email outbox payloads | 90 days |
| Audit log | 24 months |

`/api/cron/retention` runs nightly and enforces these. `/api/privacy/delete` performs verified-email erasure across applications, files, planner sessions, and CRM sync records, writes an audit entry, and emails confirmation.

---

## 16. SEO and discoverability

- Metadata API on every route: unique title (≤60 chars), description (≤155), canonical, OG/Twitter. Dynamic OG images via `opengraph-image.tsx` using the design tokens — dark ink field, mono figure, title. No stock imagery.
- JSON-LD: `Organization` + `WebSite` (root), `Service` (capability pages), `Article` (insights), `FAQPage` (`/method`, `/engagements`), `BreadcrumbList` (nested routes). Validate against Rich Results in CI as a non-blocking check.
- `sitemap.ts` generated from CMS + static routes; `robots.ts` disallowing `/admin`, `/api`, `/apply/resume`.
- `/llms.txt` describing the company, capabilities, and canonical URLs — this audience increasingly arrives via AI assistants, and a machine-readable summary is cheap.
- Semantic heading order, one `h1` per page, descriptive link text ("Read the LootSignal methodology", never "click here").
- Insights posts include author, `datePublished`, `dateModified`, and a canonical if syndicated.

---

## 17. Analytics and measurement

### 17.1 Typed event emitter

`src/lib/analytics/events.ts` exports a discriminated union of every event and a `track()` that accepts only those types. Adding an untyped event is a compile error.

### 17.2 Event taxonomy

| Event | Properties | Trigger |
|---|---|---|
| `cta_clicked` | `location`, `label`, `destination` | Any primary/secondary CTA |
| `case_study_viewed` | `slug` | Case-study route view |
| `case_study_scroll_75` | `slug`, `seconds_on_page` | 75% scroll depth |
| `weight_demo_used` | `slug`, `interactions` | Scoring-model slider used |
| `planner_started` | `entry_point` | First planner step rendered |
| `planner_step_completed` | `step_index`, `step_name` | Per step |
| `planner_completed` | `archetype`, `modules_count`, `timeline` | Outline rendered |
| `planner_outline_emailed` | `archetype` | Email captured |
| `planner_to_apply` | `archetype` | Apply clicked from outline |
| `application_started` | `source`, `planner_session_id?` | Step 1 rendered |
| `application_step_completed` | `step_index`, `step_name` | Per step |
| `application_abandoned` | `last_step` | Beacon on unload after 30s idle |
| `application_resumed` | `last_step` | Resume link used |
| `file_uploaded` | `count`, `total_size_band` | Upload success |
| `application_submitted` | `industry`, `budget_band`, `timeline`, `score_band` | Server-side |
| `booking_confirmed` | `lead_time_hours` | Cal.com webhook |
| `contact_submitted` | `kind` | Contact form |

All events are also mirrored server-side for submission/booking so ad-blockers do not corrupt the conversion numbers.

### 17.3 Attribution

Capture UTM params + referrer + landing path on first visit into a first-party cookie (13 months, consent-gated), persist onto `planner_sessions` and `applications`, and expose source in admin and CSV export. Without this, "traffic-to-qualified-lead conversion" is unmeasurable.

---

## 18. Performance budgets (enforced by Lighthouse CI, build fails on breach)

| Metric | Budget |
|---|---|
| LCP (mobile, 4G throttled) | ≤ 2.0s |
| CLS | ≤ 0.05 |
| INP | ≤ 200ms |
| First-load JS, marketing routes | ≤ 160KB gzipped |
| First-load JS, `/apply` | ≤ 220KB gzipped |
| Hero animation asset | ≤ 40KB |
| Lighthouse Performance / A11y / SEO / Best Practices | ≥ 95 / 100 / 100 / 95 |

Techniques: RSC by default with `"use client"` only at interactive leaves; `next/font` self-hosted with `display: swap` and preloaded display face; AVIF/WebP via `next/image` with explicit dimensions; dynamic import for Recharts, the planner engine UI, and the Cal.com embed; route-level `revalidate` for CMS content with on-demand revalidation via Sanity webhook.

---

## 19. Accessibility (WCAG 2.2 AA, non-negotiable)

- Contrast ≥ 4.5:1 body / 3:1 large text and UI boundaries — verified against the tokens in Section 7.1, with the green-on-dark restriction enforced.
- Full keyboard operability including the planner, multi-step form, dropzone (a visible "browse files" button, never drag-only), lightbox, and admin table. Visible focus ring: 2px `--ma-signal` with 2px offset.
- Errors: `aria-invalid`, `aria-describedby` pointing at the message, `role="alert"` summary at step level, focus moved to first invalid field.
- Live regions for async states (upload progress, outline generation, save confirmations).
- `prefers-reduced-motion` respected everywhere; decorative visuals `aria-hidden`; dashboard screenshots have purpose-describing alt text; charts have an adjacent text or table equivalent.
- Skip-to-content link, landmark regions, logical heading order, `lang` attribute, 200% zoom without horizontal scroll, 44×44px minimum touch targets.
- `@axe-core/playwright` runs against every public route in CI with zero serious/critical violations allowed.

---

## 20. Testing and CI

**Unit (Vitest):** planner rules engine (every archetype path + gap/risk branches), lead scoring bands, all Zod schemas incl. rejection cases, email-domain validation, storage key sanitization, retention query logic.

**Integration:** submit → DB rows → outbox enqueued → CRM queue enqueued; resume-token issue/verify/expiry; presign auth; rate-limit behavior at threshold.

**E2E (Playwright, the four critical paths in Section 3.3):** plus mobile viewport run, upload with a fixture file, and an admin auth-boundary test asserting `/admin` and `/api/admin/*` reject unauthenticated requests.

**A11y:** axe on every public route, keyboard-only traversal of `/apply`.

**Visual:** Playwright screenshots of home, case study, planner outline, application step 3 — desktop + mobile, light-blocking for animations.

**CI pipeline (`.github/workflows/ci.yml`):** install → typecheck → lint → unit → build → e2e (against preview) → axe → Lighthouse CI budgets → axe report artifact. Neon branch per PR, seeded via `scripts/seed.ts`. Main merges deploy to production; migrations run as a pre-deploy step with a manual approval gate.

---

## 21. CMS content model (Sanity)

```
siteSettings   — nav, footer, contact email, social, default OG, feature flags
capability     — title, slug, summary, problem, approach, outputs[], relatedCaseStudy, order, seo
caseStudy      — title, slug, client (nullable), clientPublishable (bool, gates display),
                 question, scope, dimensions[], dataSources[], modelExplanation (portable text),
                 stats[] (label, value, sourceType, asOf, confidence — ALL required),
                 screenshots[] (image, alt required, caption), features[], decisionsSupported[],
                 limitations (required), disclaimerVariant, cta, seo
methodPhase    — number, title, whatHappens, clientProvides, clientReceives, durationBand
standard       — title, description, exampleInSystem, order
engagementBand — name, rangeLow, rangeHigh, includes[], typicalTimeline, scopeDrivers[]
insight        — title, slug, excerpt, body, author, publishedAt, updatedAt, tags[], seo
faq            — question, answer, category
legalDoc       — title, slug, version, effectiveDate, body
```

Validation rules in the schema enforce Section 14: `caseStudy.stats[].sourceType` and `asOf` are required; `client` cannot be displayed unless `clientPublishable` is true; `limitations` is required before publish; `screenshots[].alt` is required. Sanity webhook triggers on-demand revalidation of affected routes.

---

## 22. Milestones

Each milestone ends with `pnpm verify` green and a written PASS/FAIL against its acceptance criteria.

**M0 — Foundation (0.5 wk).** Next.js + TS strict + Tailwind v4 + tokens.css + fonts + shadcn init + ESLint/Prettier + Vitest/Playwright harness + `CLAUDE.md` + CI skeleton + Sentry.
*Accept:* `pnpm verify` passes on an empty app; tokens render in a `/styleguide` route; Lighthouse ≥95 on that route.

**M1 — Design system & shell (1 wk).** All Section 7.5 components, header/footer/nav, mobile menu, `/styleguide` documenting every component and state, 404/500 pages.
*Accept:* axe clean on `/styleguide`; keyboard traversal of nav and menu; reduced-motion variants verified.

**M2 — Marketing pages, static content (1.5 wk).** Home (incl. `HeroDashboard`), capabilities index + detail, method, standards, engagements, about, security, contact, legal. Copy from Section 24.
*Accept:* performance budgets met on home and case-study routes; no green outside its three permitted roles; disclaimer renders where required.

**M3 — CMS integration (1 wk).** Sanity studio, all schemas + validation rules, typed queries, on-demand revalidation, LootSignal case study authored and published, `/work` index, `/insights`.
*Accept:* editing a stat in Sanity updates the live route within 60s; publishing a case study without `limitations` or a stat `asOf` is blocked by validation.

**M4 — Planner (1.5 wk).** Rules engine (pure + fully unit-tested), 6-step UI, outline renderer, session persistence, share link, email outline, homepage inline entry, analytics events.
*Accept:* engine unit tests cover all five archetypes and both gap branches; identical inputs always produce identical outlines; outline is complete with the LLM flag off.

**M5 — Application pipeline (2 wk).** Schema + migrations, 7-step form, per-step validation, autosave + resume link, presigned uploads with scan hook, Turnstile + rate limits, submit transaction, lead scoring, outbox emails, success page + Cal.com, privacy/consent capture.
*Accept:* all four critical paths pass in Playwright; a resumed draft submits correctly; duplicate submit with the same `submission_id` creates exactly one row; a 30MB file and a `.exe` are both rejected with clear messages.

**M6 — Admin console (1 wk).** Auth + allowlist + roles, pipeline table with URL-persisted filters and saved views, detail view, notes, status changes, signed file access, CSV export, audit log, outbox health, planner-sessions view.
*Accept:* unauthenticated access to `/admin` and every `/api/admin/*` route returns 401/redirect; every mutation writes an audit row; export matches the active filter exactly.

**M7 — Integrations & compliance (0.5 wk).** HubSpot sync with retry, Cal.com webhook, cron routes (outbox, crm-sync, retention), cookie consent gating, `/api/privacy/delete`, CSP finalized with nonces.
*Accept:* CSP report-only shows zero violations for 48h before enforcement; analytics does not load pre-consent (verified in Playwright); a forced CRM failure retries and surfaces in admin.

**M8 — Launch hardening (0.5 wk).** SEO metadata sweep, JSON-LD, sitemap/robots/llms.txt, OG images, Lighthouse CI budgets enforced, load test on submit endpoint, seed data removed from production, runbook written (`docs/RUNBOOK.md`: rotate keys, replay outbox, restore DB, handle a flagged file).
*Accept:* all Section 18 budgets green in CI; all Section 2.3 metrics visible in a PostHog dashboard; a full dry-run application from a clean browser produces a CRM record, two emails, an admin row, and a booking.

Indicative total: **9–10 weeks** of agent-assisted build.

---

## 23. Environment variables

```
# Core
NEXT_PUBLIC_SITE_URL, NODE_ENV

# Database
DATABASE_URL, DATABASE_URL_UNPOOLED

# Auth
AUTH_SECRET, AUTH_URL, ADMIN_ALLOWLIST            # comma-separated emails

# Storage (R2/S3)
S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_REGION

# Email
RESEND_API_KEY, EMAIL_FROM, EMAIL_INTERNAL_RECIPIENTS

# CMS
NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_READ_TOKEN,
SANITY_REVALIDATE_SECRET

# Anti-abuse
NEXT_PUBLIC_TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY,
UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

# Analytics & errors
NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST, SENTRY_DSN, SENTRY_AUTH_TOKEN

# Integrations
HUBSPOT_ACCESS_TOKEN, CALCOM_WEBHOOK_SECRET, FILE_SCAN_WEBHOOK_SECRET

# Jobs & flags
CRON_SECRET, PLANNER_LLM_ENABLED, ANTHROPIC_API_KEY
```

`src/lib/env.ts` parses all of these with Zod at boot and fails fast with a readable list of what is missing. `.env.example` stays in sync; a CI check fails if a new `process.env` reference is missing from it.

---

## 24. Copy deck (authoritative strings)

**Hero H1:** Turn market data into a decision system.
**Hero sub:** Market Analytica designs custom platforms that help companies rank opportunities, forecast demand, evaluate risk, and turn scattered research into clear business decisions.
**Primary CTA:** Apply for a Custom Build · **Secondary:** Explore Our Work · **Case-study CTA:** Build a System Like This
**Planner entry:** What decision are you trying to make? → Draft my system outline
**Final CTA block:** Your company has data. We turn it into decisions. / Apply to build a custom market-intelligence system.
**Application step names:** You · Company · The problem · Current state · What you want · Scope · Review
**Success page H1:** Application received. Here's what happens next.
**Empty admin state:** No applications match these filters. Clear filters or widen the score range.
**Upload error:** That file type isn't accepted. Upload a PDF, spreadsheet, document, or image under 25MB.
**Free-email error:** Use your company email address so we can route your application to the right team.

Voice: plain verbs, sentence case, specific over clever, no exclamation marks, no "unlock/leverage/supercharge." Numbers stated with their basis. Errors say what happened and what to do.

---

## 25. Open decisions (needed from Rick before M2/M3)

1. **Sony / client naming** — is there written permission to name any client? Until answered, build assumes no.
2. **LootSignal screenshots** — which dashboard views can be published, and do any need redaction?
3. **Budget bands** — confirm the ranges shown in the application and on `/engagements`.
4. **Engagement band names and ranges** — placeholder names are in Section 8.4.
5. **Domain, brand assets** — final logo, wordmark, favicon; license confirmation for the display typeface (Instrument Sans is the open-source fallback if no license is purchased).
6. **CRM** — HubSpot assumed. Confirm, or name the alternative before M7.
7. **Data residency** — EU processing required for any prospect segment? Affects Neon region, PostHog region, and R2 jurisdiction.
8. **Insights at launch** — ship `/insights` with 2–3 real articles, or hide it from nav until content exists? (Recommendation: hide; an empty blog reads worse than no blog.)
