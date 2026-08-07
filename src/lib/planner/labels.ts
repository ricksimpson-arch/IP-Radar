/** Human-readable labels for planner enums — shared by wizard and outline. */
import type {
  DataSource,
  DecisionType,
  Industry,
  Integration,
  Output,
  TeamSize,
  Timeline,
} from "./types";

export const INDUSTRY_LABELS: Record<Industry, string> = {
  entertainment_media: "Entertainment & media",
  ecommerce_merch: "Ecommerce & merchandise",
  consumer_products: "Consumer-product brands",
  licensing_ip: "Licensing & IP",
  private_equity: "Private equity & investment",
  corporate_strategy: "Corporate strategy / insights",
  other: "Other",
};

export const DECISION_LABELS: Record<DecisionType, string> = {
  rank_opportunities: "Rank opportunities",
  forecast_demand: "Forecast demand",
  evaluate_risk: "Evaluate risk",
  monitor_competitors: "Monitor competitors",
  price_products: "Price products",
  prioritize_portfolio: "Prioritize a portfolio",
  other: "Something else",
};

export const DATA_SOURCE_LABELS: Record<DataSource, string> = {
  internal_sales: "Internal sales data",
  crm: "CRM",
  erp: "ERP",
  retail_pos: "Retail POS",
  web_analytics: "Web analytics",
  social_listening: "Social listening",
  third_party_panel: "Third-party panel data",
  licensing_reports: "Licensing reports",
  spreadsheets_only: "Spreadsheets only",
  none_yet: "None yet",
};

export const OUTPUT_LABELS: Record<Output, string> = {
  ranked_list: "Ranked list",
  score_model: "Scoring model",
  forecast: "Forecast",
  scenario_compare: "Scenario comparison",
  exec_dashboard: "Executive dashboard",
  alerts: "Alerts",
  api_feed: "API feed",
  data_room: "Data room",
};

export const INTEGRATION_LABELS: Record<Integration, string> = {
  snowflake: "Snowflake",
  bigquery: "BigQuery",
  sheets: "Google Sheets",
  shopify: "Shopify",
  salesforce: "Salesforce",
  hubspot: "HubSpot",
  netsuite: "NetSuite",
  sftp: "SFTP",
  none: "None",
};

export const TIMELINE_LABELS: Record<Timeline, string> = {
  "6-8wk": "6–8 weeks",
  "2-3mo": "2–3 months",
  "3-6mo": "3–6 months",
  exploring: "Just exploring",
};

export const TEAM_SIZE_LABELS: Record<TeamSize, string> = {
  solo: "Just me",
  small: "Small team",
  department: "A department",
  enterprise: "Enterprise-wide",
};
