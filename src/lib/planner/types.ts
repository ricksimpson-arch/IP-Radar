/** Planner input schema — SPEC.md §9.1. */

export const INDUSTRIES = [
  "entertainment_media",
  "ecommerce_merch",
  "consumer_products",
  "licensing_ip",
  "private_equity",
  "corporate_strategy",
  "other",
] as const;
export type Industry = (typeof INDUSTRIES)[number];

export const DECISION_TYPES = [
  "rank_opportunities",
  "forecast_demand",
  "evaluate_risk",
  "monitor_competitors",
  "price_products",
  "prioritize_portfolio",
  "other",
] as const;
export type DecisionType = (typeof DECISION_TYPES)[number];

export const DATA_SOURCES = [
  "internal_sales",
  "crm",
  "erp",
  "retail_pos",
  "web_analytics",
  "social_listening",
  "third_party_panel",
  "licensing_reports",
  "spreadsheets_only",
  "none_yet",
] as const;
export type DataSource = (typeof DATA_SOURCES)[number];

export const OUTPUTS = [
  "ranked_list",
  "score_model",
  "forecast",
  "scenario_compare",
  "exec_dashboard",
  "alerts",
  "api_feed",
  "data_room",
] as const;
export type Output = (typeof OUTPUTS)[number];

export const INTEGRATIONS = [
  "snowflake",
  "bigquery",
  "sheets",
  "shopify",
  "salesforce",
  "hubspot",
  "netsuite",
  "sftp",
  "none",
] as const;
export type Integration = (typeof INTEGRATIONS)[number];

export const TIMELINES = ["6-8wk", "2-3mo", "3-6mo", "exploring"] as const;
export type Timeline = (typeof TIMELINES)[number];

export const TEAM_SIZES = ["solo", "small", "department", "enterprise"] as const;
export type TeamSize = (typeof TEAM_SIZES)[number];

export type PlannerInput = {
  industry: Industry;
  decision: DecisionType;
  decisionDetail?: string;
  dataSources: DataSource[];
  outputs: Output[];
  integrations: Integration[];
  timeline: Timeline;
  teamSize?: TeamSize;
};

export const ARCHETYPE_IDS = [
  "opportunity_ranking",
  "demand_forecasting",
  "competitive_monitoring",
  "portfolio_console",
  "pricing_margin",
] as const;
export type ArchetypeId = (typeof ARCHETYPE_IDS)[number];

export type Archetype = {
  id: ArchetypeId;
  name: string;
  summary: string;
  coreModules: ModuleId[];
  dashboardSections: string[];
};

export const MODULE_IDS = [
  "scoring_model",
  "data_ingestion",
  "forecast_engine",
  "scenario_comparison",
  "dashboard",
  "alerting",
  "methodology_docs",
  "data_room",
  "api",
] as const;
export type ModuleId = (typeof MODULE_IDS)[number];

export type MatchConfidence = "high" | "medium" | "low";

export type ModulePlan = {
  id: ModuleId;
  name: string;
  phase: "core" | "phase2";
};

export type DataPlanEntry = {
  source: DataSource;
  label: string;
  ingestion: string;
};

export type DataPlan = {
  entries: DataPlanEntry[];
  gaps: string[];
  needsDataAssembly: boolean;
};

export type EffortPhase = {
  phase: string;
  weeksLow: number;
  weeksHigh: number;
};

export type SystemOutline = {
  archetype: Archetype;
  confidence: MatchConfidence;
  rationale: string;
  modules: ModulePlan[];
  dataPlan: DataPlan;
  dashboardSections: string[];
  effort: EffortPhase[];
  risks: string[];
  assumptions: string[];
};
