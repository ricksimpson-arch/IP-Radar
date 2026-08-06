/**
 * Planner rules engine — SPEC.md §9.2.
 * Pure, deterministic, dependency-free. Identical inputs always produce
 * identical outlines; no network call is required to produce an outline.
 */
import type {
  Archetype,
  ArchetypeId,
  DataPlan,
  DataPlanEntry,
  DataSource,
  DecisionType,
  EffortPhase,
  MatchConfidence,
  ModuleId,
  ModulePlan,
  Output,
  PlannerInput,
  SystemOutline,
} from "./types";

export const ARCHETYPES: readonly Archetype[] = [
  {
    id: "opportunity_ranking",
    name: "Opportunity Ranking Engine",
    summary:
      "Scores and ranks a defined set of opportunities against weighted, transparent criteria so the next investment is a comparison, not a debate.",
    coreModules: ["scoring_model", "data_ingestion", "dashboard", "methodology_docs"],
    dashboardSections: [
      "Ranked opportunity table with adjustable weights",
      "Score breakdown per opportunity",
      "Movement since last refresh",
      "Data freshness and source status",
    ],
  },
  {
    id: "demand_forecasting",
    name: "Demand Forecasting System",
    summary:
      "Projects demand under explicit assumptions and scenario ranges, separating observed history from modeled futures.",
    coreModules: ["forecast_engine", "data_ingestion", "scenario_comparison", "dashboard", "methodology_docs"],
    dashboardSections: [
      "Baseline forecast with confidence bands",
      "Scenario comparison (base / upside / downside)",
      "Observed vs. modeled split",
      "Assumption register",
    ],
  },
  {
    id: "competitive_monitoring",
    name: "Competitive Monitoring Platform",
    summary:
      "Tracks competitors, pricing, and market whitespace continuously, and alerts when a position changes enough to matter.",
    coreModules: ["data_ingestion", "dashboard", "alerting", "methodology_docs"],
    dashboardSections: [
      "Competitor position matrix",
      "Pricing and positioning changes over time",
      "Whitespace map",
      "Alert history and thresholds",
    ],
  },
  {
    id: "portfolio_console",
    name: "Portfolio Decision Console",
    summary:
      "Puts an entire portfolio on one comparable footing — risk, return signal, and strategic fit — so allocation and divestment decisions share a common basis.",
    coreModules: ["scoring_model", "data_ingestion", "scenario_comparison", "dashboard", "methodology_docs"],
    dashboardSections: [
      "Portfolio overview with comparable scoring",
      "Risk flags and exposure",
      "Scenario impact across holdings",
      "Decision log",
    ],
  },
  {
    id: "pricing_margin",
    name: "Pricing & Margin Model",
    summary:
      "Models price, elasticity signal, and margin outcomes so pricing moves are tested before they ship.",
    coreModules: ["scoring_model", "data_ingestion", "scenario_comparison", "dashboard", "methodology_docs"],
    dashboardSections: [
      "Price ladder and margin waterfall",
      "Scenario outcomes per price move",
      "Competitor price reference",
      "Assumption register",
    ],
  },
] as const;

const MODULE_NAMES: Record<ModuleId, string> = {
  scoring_model: "Scoring model",
  data_ingestion: "Data ingestion layer",
  forecast_engine: "Forecast engine",
  scenario_comparison: "Scenario comparison",
  dashboard: "Executive dashboard",
  alerting: "Alerting",
  methodology_docs: "Methodology documentation",
  data_room: "Data room",
  api: "API feed",
};

/** Primary signal: the decision the visitor names. */
const DECISION_WEIGHTS: Record<DecisionType, Partial<Record<ArchetypeId, number>>> = {
  rank_opportunities: { opportunity_ranking: 6 },
  forecast_demand: { demand_forecasting: 6 },
  evaluate_risk: { portfolio_console: 5, demand_forecasting: 2 },
  monitor_competitors: { competitive_monitoring: 6 },
  price_products: { pricing_margin: 6 },
  prioritize_portfolio: { portfolio_console: 6, opportunity_ranking: 2 },
  other: {},
};

/** Secondary signal: the outputs they want. */
const OUTPUT_WEIGHTS: Record<Output, Partial<Record<ArchetypeId, number>>> = {
  ranked_list: { opportunity_ranking: 2, portfolio_console: 1 },
  score_model: { opportunity_ranking: 2, pricing_margin: 1 },
  forecast: { demand_forecasting: 2, pricing_margin: 1 },
  scenario_compare: { demand_forecasting: 1, portfolio_console: 1, pricing_margin: 1 },
  exec_dashboard: {},
  alerts: { competitive_monitoring: 2 },
  api_feed: {},
  data_room: { portfolio_console: 1 },
};

const OUTPUT_MODULES: Partial<Record<Output, ModuleId>> = {
  forecast: "forecast_engine",
  scenario_compare: "scenario_comparison",
  alerts: "alerting",
  api_feed: "api",
  data_room: "data_room",
};

const SOURCE_LABELS: Record<DataSource, { label: string; ingestion: string }> = {
  internal_sales: { label: "Internal sales data", ingestion: "Scheduled export or warehouse connection" },
  crm: { label: "CRM records", ingestion: "Native connector (e.g. Salesforce/HubSpot API)" },
  erp: { label: "ERP data", ingestion: "Scheduled extract via SFTP or API" },
  retail_pos: { label: "Retail POS data", ingestion: "Feed normalization + scheduled ingestion" },
  web_analytics: { label: "Web analytics", ingestion: "API pull on a daily cadence" },
  social_listening: { label: "Social listening", ingestion: "Third-party API with keyword configuration" },
  third_party_panel: { label: "Third-party panel data", ingestion: "Licensed file drop, validated on ingest" },
  licensing_reports: { label: "Licensing reports", ingestion: "Structured template + document parsing" },
  spreadsheets_only: { label: "Spreadsheets", ingestion: "Template migration into a governed schema" },
  none_yet: { label: "No sources identified yet", ingestion: "Source identification during discovery" },
};

/** Sources that can carry a demand history for forecasting. */
const TIME_SERIES_SOURCES: readonly DataSource[] = [
  "internal_sales",
  "retail_pos",
  "web_analytics",
  "erp",
];

export function selectArchetype(input: PlannerInput): {
  archetype: Archetype;
  confidence: MatchConfidence;
} {
  const scores = new Map<ArchetypeId, number>();
  for (const a of ARCHETYPES) scores.set(a.id, 0);

  for (const [id, w] of Object.entries(DECISION_WEIGHTS[input.decision])) {
    scores.set(id as ArchetypeId, (scores.get(id as ArchetypeId) ?? 0) + (w ?? 0));
  }
  for (const output of input.outputs) {
    for (const [id, w] of Object.entries(OUTPUT_WEIGHTS[output])) {
      scores.set(id as ArchetypeId, (scores.get(id as ArchetypeId) ?? 0) + (w ?? 0));
    }
  }

  // Deterministic winner: highest score, ties broken by ARCHETYPES order.
  let winner: Archetype = ARCHETYPES[0] as Archetype;
  let best = -1;
  for (const a of ARCHETYPES) {
    const s = scores.get(a.id) ?? 0;
    if (s > best) {
      best = s;
      winner = a;
    }
  }

  const runnerUp = Math.max(
    ...ARCHETYPES.filter((a) => a.id !== winner.id).map((a) => scores.get(a.id) ?? 0),
  );

  let confidence: MatchConfidence;
  if (best >= 6 && best - runnerUp >= 4) confidence = "high";
  else if (best >= 4) confidence = "medium";
  else confidence = "low";

  return { archetype: winner, confidence };
}

export function deriveModules(input: PlannerInput, archetype: Archetype): ModulePlan[] {
  const core = new Set<ModuleId>(archetype.coreModules);
  const phase2 = new Set<ModuleId>();

  for (const output of input.outputs) {
    const mod = OUTPUT_MODULES[output];
    if (mod && !core.has(mod)) phase2.add(mod);
  }
  // A dashboard is always part of the delivered system.
  core.add("dashboard");
  core.add("methodology_docs");

  const order = (id: ModuleId): number =>
    (["data_ingestion", "scoring_model", "forecast_engine", "scenario_comparison", "dashboard", "alerting", "api", "data_room", "methodology_docs"] as ModuleId[]).indexOf(id);

  const toPlan = (id: ModuleId, phase: "core" | "phase2"): ModulePlan => ({
    id,
    name: MODULE_NAMES[id],
    phase,
  });

  return [
    ...[...core].sort((a, b) => order(a) - order(b)).map((id) => toPlan(id, "core")),
    ...[...phase2].sort((a, b) => order(a) - order(b)).map((id) => toPlan(id, "phase2")),
  ];
}

export function deriveDataPlan(input: PlannerInput): DataPlan {
  const entries: DataPlanEntry[] = input.dataSources.map((source) => ({
    source,
    label: SOURCE_LABELS[source].label,
    ingestion: SOURCE_LABELS[source].ingestion,
  }));

  const gaps: string[] = [];
  const needsDataAssembly =
    input.dataSources.length === 0 ||
    input.dataSources.includes("none_yet") ||
    input.dataSources.includes("spreadsheets_only");

  if (needsDataAssembly) {
    gaps.push(
      "No system-ready data source is identified yet. The plan starts with a discovery and data-assembly phase before any model is built — there is no way around this step, and pretending otherwise produces a dashboard with nothing underneath it.",
    );
  }

  if (
    input.decision === "forecast_demand" &&
    !input.dataSources.some((s) => TIME_SERIES_SOURCES.includes(s))
  ) {
    gaps.push(
      "Forecasting needs a demand history. None of the selected sources carries a usable time series, so the first modeling step is locating or reconstructing one.",
    );
  }

  return { entries, gaps, needsDataAssembly };
}

export function deriveEffort(input: PlannerInput): EffortPhase[] {
  const plan = deriveDataPlan(input);
  const moduleCount = deriveModules(input, selectArchetype(input).archetype).length;

  const discovery: EffortPhase = plan.needsDataAssembly
    ? { phase: "Discovery & data assembly", weeksLow: 2, weeksHigh: 4 }
    : { phase: "Discovery", weeksLow: 1, weeksHigh: 2 };

  const modeling: EffortPhase = {
    phase: "Research & modeling",
    weeksLow: 2,
    weeksHigh: input.decision === "forecast_demand" ? 5 : 4,
  };

  const platform: EffortPhase = {
    phase: "Platform development",
    weeksLow: moduleCount > 6 ? 4 : 3,
    weeksHigh: moduleCount > 6 ? 8 : 6,
  };

  const launch: EffortPhase = { phase: "Launch & improvement", weeksLow: 1, weeksHigh: 2 };

  return [discovery, modeling, platform, launch];
}

export function deriveRisks(input: PlannerInput): string[] {
  const risks: string[] = [];
  const plan = deriveDataPlan(input);

  if (plan.needsDataAssembly && input.timeline === "6-8wk") {
    risks.push(
      "The 6–8 week timeline is unrealistic without a system-ready data source. Data assembly alone typically takes 2–4 weeks; plan for the 2–3 month band or reduce scope to a single decision.",
    );
  }
  if (input.integrations.filter((i) => i !== "none").length > 3) {
    risks.push(
      "Four or more live integrations is the largest single driver of schedule risk. Expect the integration phase to run in parallel with modeling, and expect at least one upstream system to need remediation.",
    );
  }
  if (input.decision === "other") {
    risks.push(
      "The target decision isn't yet specific. The first discovery session narrows it to one named, recurring decision — a system built for a vague question stays vague.",
    );
  }
  if (input.timeline === "exploring") {
    risks.push(
      "No timeline pressure means no forcing function. We recommend anchoring the build to a real upcoming decision date, even a soft one.",
    );
  }
  return risks;
}

function deriveAssumptions(input: PlannerInput): string[] {
  const assumptions: string[] = [
    "Scope is confirmed in discovery; this outline is a starting hypothesis, not a quote.",
    "Week bands assume one primary stakeholder is available for weekly working sessions.",
  ];
  if (input.dataSources.length > 0 && !deriveDataPlan(input).needsDataAssembly) {
    assumptions.push(
      "Named data sources are assumed to be accessible with credentials at project start.",
    );
  }
  return assumptions;
}

function buildRationale(input: PlannerInput, archetype: Archetype, confidence: MatchConfidence): string {
  const decisionText: Record<DecisionType, string> = {
    rank_opportunities: "ranking a set of opportunities against consistent criteria",
    forecast_demand: "forecasting demand under explicit assumptions",
    evaluate_risk: "evaluating risk on a comparable basis",
    monitor_competitors: "monitoring competitor movement continuously",
    price_products: "testing price and margin moves before shipping them",
    prioritize_portfolio: "prioritizing a portfolio on one comparable footing",
    other: "a decision we'd want to pin down in discovery",
  };
  const confidenceText: Record<MatchConfidence, string> = {
    high: "This is a strong match: the decision and the outputs you selected point at the same system shape.",
    medium: "This is a reasonable match, though some of the outputs you selected pull toward a different shape — discovery would settle which is primary.",
    low: "Treat this as a starting hypothesis: the inputs don't point clearly at one system shape yet, and the first discovery session would resolve that.",
  };
  return `You described ${decisionText[input.decision]}. That maps to a ${archetype.name}: ${archetype.summary} ${confidenceText[confidence]}`;
}

/** Assemble the complete deterministic System Outline (SPEC.md §9.3). */
export function buildOutline(input: PlannerInput): SystemOutline {
  const { archetype, confidence } = selectArchetype(input);
  return {
    archetype,
    confidence,
    rationale: buildRationale(input, archetype, confidence),
    modules: deriveModules(input, archetype),
    dataPlan: deriveDataPlan(input),
    dashboardSections: archetype.dashboardSections,
    effort: deriveEffort(input),
    risks: deriveRisks(input),
    assumptions: deriveAssumptions(input),
  };
}
