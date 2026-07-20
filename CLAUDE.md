# IP Radar — FYUL Entertainment Merch Revenue Platform

Internal decision platform: ranks entertainment IP licensing opportunities by
probability-weighted **FYUL contribution value** (never GMV), forecasts
conditional merch demand (weekly P10/P50/P90, 156-week horizon), and
recommends an operating route (Snow Commerce / Printful / Printify / hybrid).

## The one rule that governs everything

Every money value is tagged with exactly one economic layer. There is **no
generic `revenue` field anywhere** — enforced by eslint rules and
`scripts/check-layer-tagging.mjs` in CI.

```
CONSUMER_GMS → STORE_NET_SALES → FYUL_RECOGNIZED → FYUL_CONTRIBUTION → PIPELINE_EV
```

The five identities are pure functions in `packages/economics` with golden
tests (`test/fixtures/launches.json`, hand-computed to the cent). If deal
terms are unmapped, `fyulRecognized` throws `TermsUnmappedError`
(`TERMS_UNMAPPED`) and the API returns store-layer scenarios only. **Never
estimate a take rate. There is no default take rate.**

## Layout

| Path | What |
|---|---|
| `packages/economics` | Five-layer enum + identity functions + golden tests. Changes require fixture updates AND Finance review (CODEOWNERS). |
| `packages/db` | Postgres 16 SQL migrations (spec §4 schema). Money = BIGINT cents, layer-named columns. |
| `apps/api` | Fastify API. Every economic response carries `metric_version`, `model_version`, `data_snapshot_id`, and honors `TERMS_UNMAPPED`. |
| `apps/web` | Next.js 15 (App Router, strict TS, Tailwind). First surface: five-layer economics bridge. |
| `services/forecast` | Python FastAPI. Stub today, but the response contract (P10/P50/P90, comparables disclosed, confidence label, OOD abstention) is binding. |
| `config/assumptions.example.yaml` | Named placeholders for unknown business values. |
| `OPEN_QUESTIONS.md` | Unresolved Phase 0 questions — add to it whenever a real value is unknown. |

## Commands

```bash
pnpm install               # workspace install
pnpm ci                    # typecheck + lint + test + layer-tagging guard (what CI runs)
pnpm --filter @ip-radar/economics test   # golden tests only
cd services/forecast && pip install -e ".[dev]" && pytest -q
```

## Guardrails for every session (from the build spec §9)

- **Never invent** internal table names, take rates, deal terms, or provider
  costs. Unknown value → named placeholder in `config/assumptions.example.yaml`
  + entry in `OPEN_QUESTIONS.md`.
- **Never merge money across layers** or create an untyped revenue field.
- **Never emit** FYUL_RECOGNIZED / FYUL_CONTRIBUTION for opportunities with
  unmapped terms — return `TERMS_UNMAPPED`.
- Ship simple, auditable baselines before complex models; complex models only
  replace baselines with a committed backtest report showing durable lift
  (LOIO + time-aware).
- Confidential fields (contract terms, guarantees, provider unit costs) flow
  through RLS + role checks; never in logs, error messages, or seeds.
- Every forecast-affecting change bumps `metric_version` or `model_version`.
- Commit messages reference FR-IDs (FR-01…FR-12) from the brief where
  applicable (FR mapping doc pending — OPEN_QUESTIONS #10).
- Non-goals — do not build: autonomous licensing decisions, automated contract
  commitments, SKU-level forecasts without comparables, default take rates,
  GMV-optimized ranking.
