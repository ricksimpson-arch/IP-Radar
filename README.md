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
apps/web            Next.js 15 — economics bridge, EV-ranked portfolio, title
                    workspace (scenario lab, sensitivity, routing), governance
apps/api            Fastify — portfolio ranking, scenario preview, sensitivity,
                    RBAC-redacted agreement terms, governance snapshot, CSV
                    export; layer-tagged responses, TERMS_UNMAPPED guard
packages/economics  Five economic layers, identity functions, waterfall,
                    scenario engine, sensitivity/break-evens, routing scorer,
                    golden tests
packages/demo-data  Shared synthetic opportunities + route candidates (all
                    titles/terms fictional)
packages/db         Postgres 16 migrations (schema per build-spec §4)
services/forecast   Python FastAPI — cohort-median demand baseline (abstains
                    under 3 comparables / OOD), stage-conversion P(win)
                    baseline, Brier + reliability, backtest metrics (WAPE/MAE/
                    bias/coverage), leakage guard, routing optimizer,
                    reproducible forecast runs
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

## Status vs the build spec

| Spec area | State |
|---|---|
| §2 five-layer rule + identities | Done — golden-tested to the cent, CI-guarded repo-wide |
| §4 schema | Migration written; DB not provisioned yet |
| §5 rights baseline | Stage-conversion baseline + Brier/reliability done; calibrated classifier & survival model need real CRM history |
| §5 demand baseline | Cohort-median with partial pooling + cold-start abstention done; ML promotion gated on backtests |
| §5 sensitivity | Done (top-5 drivers, break-evens; unmodeled drivers disclosed) |
| §5 routing | Prototype done (TS + Python, rule-identical); real weights await Phase 0 |
| §6 surfaces | Bridge, portfolio, title workspace, scenario lab, routing view, governance, CSV exports done; saved/shareable scenarios need the DB |
| §8 testing | Golden, access/RBAC, reproducibility, leakage, calibration-metric, backtest-metric tests done; reconciliation tests need Finance-approved actuals |
| Auth/RLS, scheduled refresh, model registry | Phase 3 — blocked on SSO choice, DB, and real sources |

Remaining work is blocked on Phase 0 answers (see `OPEN_QUESTIONS.md`) and
real data access — by design, none of it is guessable.

## Project docs

- `CLAUDE.md` — working rules for AI-assisted sessions (layer rule, guardrails)
- `OPEN_QUESTIONS.md` — Phase 0 blockers awaiting business/Finance answers
- `packages/db/README.md` — schema conventions
