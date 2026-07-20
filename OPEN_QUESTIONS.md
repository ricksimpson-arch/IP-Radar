# Open questions — resolve before Phase 1

Tracked per build-spec §10. Owners and answers get filled in during Phase 0
alignment; anything unresolved blocks the phase exit gate it affects.

| # | Question | Status | Owner | Answer |
|---|---|---|---|---|
| 1 | Who is the single accountable product owner across Snow Commerce, Printful, Printify, Finance, Data? | OPEN | — | — |
| 2 | Pilot cohort: which 5 historical launches + 5 current IP candidates? | OPEN | — | — |
| 3 | Official FYUL contribution definition — which costs are variable, allocated, excluded? | OPEN | — | — |
| 4 | Which contract/CRM fields are approved for model training, at what access level? | OPEN | — | — |
| 5 | Which routing decisions may the system recommend vs. only explain? | OPEN | — | — |
| 6 | Accuracy/calibration thresholds for production, and exception approver? (placeholder thresholds live in `config/assumptions.example.yaml`) | OPEN | — | — |
| 7 | Which recurring meeting owns portfolio review, overrides, and model performance? | OPEN | — | — |
| 8 | Confirm or replace the default stack (§3) — incl. migration runner for `packages/db`, tRPC vs REST, MLflow vs run-metadata table, Dagster vs cron. | OPEN | eng lead | — |
| 9 | Real source systems + credentials path for CRM, commerce, Printful, Printify, finance extracts (read-only). | OPEN | — | — |

## Added during scaffolding

| # | Question | Status | Owner | Answer |
|---|---|---|---|---|
| 10 | FR-ID mapping: the brief references FR-01…FR-12 but the mapping document is not in this repo — need it to tag commits/PRs correctly. | OPEN | — | — |
| 11 | Finance owner GitHub handle for `/packages/economics/` CODEOWNERS (currently placeholder `@ricksimpson-arch`). | OPEN | — | — |
| 12 | Reconciliation tolerance (`reconciliation.tolerance_bps`) — config value, set at Phase 0 sign-off, not hardcoded. | OPEN | Finance | — |
| 13 | Provider capacity freshness SLA (`data_freshness.provider_capacity_sla_days`). | OPEN | Ops | — |
| 14 | Launch-delay discount curve for PIPELINE_EV (`pipeline_ev.delay_discount_curve`). | OPEN | Finance/BD | — |
| 15 | Recognized-component kind taxonomy: `packages/economics` currently maps ROYALTY, REVENUE_SHARE, SERVICE_FEE_FIXED, SERVICE_FEE_RATE, MINIMUM_GUARANTEE_TRUE_UP. Finance to confirm the complete list; anything else stays TERMS_UNMAPPED. | OPEN | Finance | — |
| 16 | SSO provider (Okta vs Entra; NextAuth vs WorkOS) — auth is not scaffolded yet, app must stay internal-only. | OPEN | IT/Security | — |
