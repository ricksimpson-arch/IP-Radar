-- 0001_init.sql — starting schema per build-spec §4 (refine in Phase 0 discovery).
-- Conventions:
--   * money columns are BIGINT integer cents, named for their economic layer,
--     and never named "revenue" (CI-enforced);
--   * every table has created_at/updated_at;
--   * effective dating where the spec requires it;
--   * confidential columns are grouped and commented — RLS policies land in Phase 3.

BEGIN;

CREATE TYPE economic_layer AS ENUM (
  'CONSUMER_GMS',
  'STORE_NET_SALES',
  'FYUL_RECOGNIZED',
  'FYUL_CONTRIBUTION',
  'PIPELINE_EV'
);

CREATE TYPE opportunity_status AS ENUM (
  'PROSPECT', 'QUALIFIED', 'IN_NEGOTIATION', 'WON', 'LOST', 'ON_HOLD', 'ARCHIVED'
);

CREATE TABLE ip_opportunities (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  rightsholder     TEXT NOT NULL,
  territory        TEXT[] NOT NULL DEFAULT '{}',
  categories       TEXT[] NOT NULL DEFAULT '{}',
  channel          TEXT,
  exclusivity      TEXT,
  owner            TEXT NOT NULL,            -- named accountable owner (spec §6.3)
  status           opportunity_status NOT NULL DEFAULT 'PROSPECT',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Event-grained CRM history; snapshots are insufficient for the survival model.
CREATE TABLE crm_stage_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id   UUID NOT NULL REFERENCES ip_opportunities(id),
  stage            TEXT NOT NULL,
  entered_at       TIMESTAMPTZ NOT NULL,
  exited_at        TIMESTAMPTZ,
  outcome          TEXT,                     -- advanced / lost / stalled; required by DQ gate before training
  lost_reason      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_crm_stage_events_opportunity ON crm_stage_events (opportunity_id, entered_at);

CREATE TABLE store_weeks (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id                    TEXT NOT NULL,
  week                        DATE NOT NULL,  -- ISO week start
  sessions                    BIGINT,
  channel                     TEXT,
  orders                      BIGINT NOT NULL DEFAULT 0,
  units                       BIGINT NOT NULL DEFAULT 0,
  -- sales bridge, layer-tagged integer cents:
  consumer_gms_cents          BIGINT NOT NULL DEFAULT 0,
  discounts_cents             BIGINT NOT NULL DEFAULT 0,
  cancellations_cents         BIGINT NOT NULL DEFAULT 0,
  refunds_cents               BIGINT NOT NULL DEFAULT 0,
  chargebacks_cents           BIGINT NOT NULL DEFAULT 0,
  excluded_taxes_duties_cents BIGINT NOT NULL DEFAULT 0,
  store_net_sales_cents       BIGINT NOT NULL DEFAULT 0,
  marketing_spend_cents       BIGINT NOT NULL DEFAULT 0,
  campaign_event              TEXT,
  ip_archetype                TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (store_id, week)
);
COMMENT ON COLUMN store_weeks.consumer_gms_cents    IS 'economic_layer=CONSUMER_GMS';
COMMENT ON COLUMN store_weeks.store_net_sales_cents IS 'economic_layer=STORE_NET_SALES';

CREATE TABLE order_lines (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id           TEXT NOT NULL,
  order_id           TEXT NOT NULL,
  sku                TEXT NOT NULL,
  product            TEXT,
  decoration         TEXT,
  provider           TEXT,                  -- snow / printful / printify / ...
  facility           TEXT,
  country            TEXT,
  line_gms_cents     BIGINT NOT NULL,
  unit_cost_cents    BIGINT,                -- CONFIDENTIAL: finance/data_eng/admin only (RLS Phase 3)
  shipping_cost_cents BIGINT,               -- CONFIDENTIAL: finance/data_eng/admin only (RLS Phase 3)
  ordered_at         TIMESTAMPTZ NOT NULL,
  shipped_at         TIMESTAMPTZ,
  delivered_at       TIMESTAMPTZ,
  defect_flag        BOOLEAN NOT NULL DEFAULT FALSE,
  reprint_flag       BOOLEAN NOT NULL DEFAULT FALSE,
  cancelled_flag     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON COLUMN order_lines.line_gms_cents IS 'economic_layer=CONSUMER_GMS';
CREATE INDEX idx_order_lines_store_ordered ON order_lines (store_id, ordered_at);

-- Effective-dated, region-specific; stale rows past freshness SLA exclude the route.
CREATE TABLE catalog_capacity (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku              TEXT NOT NULL,
  provider         TEXT NOT NULL,
  region           TEXT NOT NULL,
  week             DATE NOT NULL,
  availability     BOOLEAN NOT NULL DEFAULT TRUE,
  price_cents      BIGINT,
  cost_cents       BIGINT,                  -- CONFIDENTIAL: finance/data_eng/admin only (RLS Phase 3)
  capacity_units   BIGINT,
  sla_days         INTEGER,
  quality_score    NUMERIC(4,3),
  moq              INTEGER,
  lead_time_days   INTEGER,
  effective_from   TIMESTAMPTZ NOT NULL,
  effective_to     TIMESTAMPTZ,             -- NULL = currently effective
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_catalog_capacity_lookup ON catalog_capacity (provider, region, sku, week);

-- CONFIDENTIAL TABLE: agreements + versions visible only to finance/data_eng/admin (RLS Phase 3).
CREATE TABLE agreements (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id   UUID NOT NULL REFERENCES ip_opportunities(id),
  rightsholder     TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'DRAFT',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE agreement_versions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id          UUID NOT NULL REFERENCES agreements(id),
  version               INTEGER NOT NULL,
  currency              CHAR(3) NOT NULL,
  -- typed component schema validated in packages/economics (fyulRecognized);
  -- unmapped kinds/terms => TERMS_UNMAPPED, never estimated:
  recognized_components JSONB NOT NULL DEFAULT '[]',
  royalty_base_layer    economic_layer,      -- must be CONSUMER_GMS or STORE_NET_SALES when set
  royalty_rate_bps      INTEGER,
  guarantee_cents       BIGINT,              -- CONFIDENTIAL
  advance_cents         BIGINT,              -- CONFIDENTIAL
  term_start            DATE,
  term_end              DATE,
  territory             TEXT[] NOT NULL DEFAULT '{}',
  categories            TEXT[] NOT NULL DEFAULT '{}',
  approvals             JSONB NOT NULL DEFAULT '[]',
  effective_from        TIMESTAMPTZ NOT NULL,
  effective_to          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (agreement_id, version),
  CONSTRAINT royalty_base_is_store_layer CHECK (
    royalty_base_layer IS NULL OR royalty_base_layer IN ('CONSUMER_GMS', 'STORE_NET_SALES')
  )
);

CREATE TABLE compliance_records (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier                TEXT NOT NULL,
  facility                TEXT,
  product                 TEXT,
  market                  TEXT NOT NULL,
  eligible                BOOLEAN NOT NULL,
  certificates            JSONB NOT NULL DEFAULT '[]',
  exceptions              JSONB NOT NULL DEFAULT '[]',
  onboarding_lead_time_days INTEGER,
  effective_from          TIMESTAMPTZ NOT NULL,
  effective_to            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Versioned finance definitions; every forecast pins one version.
CREATE TABLE finance_metric_versions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_version          TEXT NOT NULL UNIQUE,   -- e.g. metric-v1
  recognition_rules       JSONB NOT NULL,
  contribution_definition JSONB NOT NULL,
  fx_table_ref            TEXT,
  fiscal_calendar_ref     TEXT,
  approved_by             TEXT,
  effective_from          TIMESTAMPTZ NOT NULL,
  effective_to            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE scenarios (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  version             INTEGER NOT NULL DEFAULT 1,
  owner               TEXT NOT NULL,
  assumptions         JSONB NOT NULL DEFAULT '{}',
  parent_scenario_id  UUID REFERENCES scenarios(id),
  share_token         TEXT UNIQUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Immutable run metadata: no updated_at by design; rows are never updated.
CREATE TABLE forecast_runs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id    UUID REFERENCES ip_opportunities(id),
  data_snapshot_id  TEXT NOT NULL,
  metric_version    TEXT NOT NULL REFERENCES finance_metric_versions(metric_version),
  model_version     TEXT NOT NULL,
  assumptions       JSONB NOT NULL DEFAULT '{}',
  outputs_ref       TEXT,                    -- pointer to stored output artifact
  created_by        TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE overrides (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_run_id  UUID NOT NULL REFERENCES forecast_runs(id),
  field            TEXT NOT NULL,
  original_value   JSONB NOT NULL,
  override_value   JSONB NOT NULL,
  reason           TEXT NOT NULL,
  created_by       TEXT NOT NULL,
  reverted_at      TIMESTAMPTZ,             -- overrides are reversible
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE decision_log (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id   UUID NOT NULL REFERENCES ip_opportunities(id),
  decision         TEXT NOT NULL,
  rationale        TEXT NOT NULL,
  owner            TEXT NOT NULL,
  decided_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMIT;
