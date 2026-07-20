# @ip-radar/db

Postgres 16 schema migrations for the FYUL platform (§4 of the build spec).

- Plain SQL migrations in `migrations/`, applied in filename order. Migration
  runner selection (e.g. `graphile-migrate`, `dbmate`, `node-pg-migrate`) is an
  open Phase 0 question — see `OPEN_QUESTIONS.md` #8.
- **Layer rule:** every money column is named for its economic layer
  (`*_gms_cents`, `*_store_net_cents`, …) and commented with its
  `economic_layer` tag. No column is ever named `revenue`
  (CI-enforced by `scripts/check-layer-tagging.mjs`).
- All money is stored as `BIGINT` integer cents.
- Row-level security policies for client/rightsholder confidentiality land in
  Phase 3; tables carrying confidential terms are marked with comments now.
- Warehouse transforms (dbt, as-of joins, leakage tests) live in a separate
  `warehouse/` project to be scaffolded when real sources are mapped (Phase 0
  discovery output).
