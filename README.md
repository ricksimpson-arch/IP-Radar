# IP Radar

**FYUL Entertainment Merch Revenue Platform** — an internal decision platform
that ranks entertainment IP licensing opportunities by probability-weighted
FYUL contribution value (not GMV), forecasts conditional merchandise demand
with explicit uncertainty, and recommends an operating route
(Snow Commerce / Printful / Printify / hybrid).

> Phase 0 scaffold. No real data sources are connected; all figures in the
> demo surfaces are synthetic fixtures.

## Monorepo

```
apps/web            Next.js 15 — five-layer FYUL economics bridge (first surface)
apps/api            Fastify — layer-tagged responses, TERMS_UNMAPPED guard
packages/economics  The five economic layers + identity functions + golden tests
packages/db         Postgres 16 migrations (schema per build-spec §4)
services/forecast   Python FastAPI — forecast contract (P10/P50/P90, OOD abstention)
config/             Named assumption placeholders (no invented business values)
```

## The five economic layers

Every money value in this codebase is tagged with exactly one layer — there is
no generic `revenue` field anywhere (CI-enforced):

1. `CONSUMER_GMS` — checkout merch value pre-refund/adjustment
2. `STORE_NET_SALES` — GMS − discounts − cancels − refunds − chargebacks − taxes/duties
3. `FYUL_RECOGNIZED` — contract-defined recognized components only; **no default take rate**
4. `FYUL_CONTRIBUTION` — recognized − variable costs − committed launch costs − guarantee exposure − write-downs
5. `PIPELINE_EV` — P(rights win) × conditional contribution × delay discount × capacity factor

Opportunities with unmapped deal terms get store-layer scenarios only and an
explicit `TERMS_UNMAPPED` status. We never estimate.

## Getting started

```bash
pnpm install
pnpm ci                          # typecheck + lint + tests + layer-tagging guard

pnpm --filter @ip-radar/web dev  # economics bridge on :3000
pnpm --filter @ip-radar/api dev  # api on :3001

cd services/forecast
pip install -e ".[dev]" && pytest -q
uvicorn app.main:app --port 8000
```

## Project docs

- `CLAUDE.md` — working rules for AI-assisted sessions (layer rule, guardrails)
- `OPEN_QUESTIONS.md` — Phase 0 blockers awaiting business/Finance answers
- `packages/db/README.md` — schema conventions
