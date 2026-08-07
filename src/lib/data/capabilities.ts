/**
 * Capability content — SPEC.md §8.1 Block 2 and §8.6.
 * TODO(M3): this file is the CMS stand-in; Sanity's `capability` schema
 * replaces it with identical field shapes, so pages don't change.
 */

export type Capability = {
  slug: string;
  title: string;
  oneLine: string;
  problem: string;
  approach: string;
  outputs: string[];
};

export const capabilities: readonly Capability[] = [
  {
    slug: "market-opportunity-scoring",
    title: "Market Opportunity Scoring",
    oneLine: "Rank products, markets, or investments using custom criteria.",
    problem:
      "Teams comparing dozens of opportunities usually do it in a spreadsheet where the weighting lives in one person's head. Every review meeting relitigates the criteria instead of the decision.",
    approach:
      "We define the scoring dimensions with you, make the weights explicit and adjustable, and build a model that scores every opportunity the same way every time. The formula is visible in the product — if a score moves, you can see exactly why.",
    outputs: [
      "A ranked, filterable opportunity table with adjustable weights",
      "Score breakdowns per opportunity, with source and confidence on every figure",
      "A methodology page your analysts can audit",
    ],
  },
  {
    slug: "forecasting-scenarios",
    title: "Forecasting & Scenarios",
    oneLine: "Model likely outcomes, risks, and future market changes.",
    problem:
      "A single-number forecast hides its assumptions and fails silently. When it misses, nobody can say which assumption broke.",
    approach:
      "We build forecasts as ranges under named assumptions, keep observed history visually separate from modeled futures, and let you compare scenarios side by side before committing.",
    outputs: [
      "Baseline forecast with confidence bands and a stated horizon",
      "Scenario comparison across base, upside, and downside assumption sets",
      "An assumption register that updates with the model",
    ],
  },
  {
    slug: "competitive-intelligence",
    title: "Competitive Intelligence",
    oneLine: "Compare competitors, pricing, positioning, and market whitespace.",
    problem:
      "Competitor tracking done by hand goes stale the week after it's compiled, and the interesting movements happen between compilations.",
    approach:
      "We set up continuous collection on the signals that matter for your category, normalize them into comparable views, and alert you when a position changes beyond a threshold you set.",
    outputs: [
      "A competitor position matrix that stays current",
      "Pricing and positioning change history",
      "Whitespace analysis mapped to your capabilities",
    ],
  },
  {
    slug: "executive-dashboards",
    title: "Executive Dashboards",
    oneLine: "Convert complex research into clear decision-making tools.",
    problem:
      "Research that lives in decks gets read once. Decisions recur; the evidence for them should be standing infrastructure, not an attachment.",
    approach:
      "We design dashboards around the decisions they support — every view answers a question someone actually asks — with drill-down to the underlying sources so trust doesn't depend on taking our word.",
    outputs: [
      "Decision-oriented dashboard views with drill-down to source data",
      "Freshness indicators on every panel",
      "Export and briefing formats for board and deal contexts",
    ],
  },
  {
    slug: "data-integration",
    title: "Data Integration",
    oneLine: "Combine company data with external research and market signals.",
    problem:
      "Internal sales data and external market research usually live in different tools, different grains, and different definitions — so nobody can answer questions that need both.",
    approach:
      "We build the ingestion and normalization layer that puts internal and external sources into one governed schema, with validation on ingest and lineage on every field.",
    outputs: [
      "Automated ingestion from your systems and licensed sources",
      "One governed schema with documented lineage",
      "Data-quality monitoring with alerting on failures",
    ],
  },
  {
    slug: "custom-analytics-systems",
    title: "Custom Analytics Systems",
    oneLine: "Build a platform around each client's workflow and decisions.",
    problem:
      "Off-the-shelf analytics tools force your decision process into their model. The mismatch is where adoption dies.",
    approach:
      "We start from the decisions your team makes on a recurring basis and build the system around that workflow — the model, the views, the alerts, and the documentation are all shaped by how the decision actually gets made.",
    outputs: [
      "A platform whose structure mirrors your decision process",
      "Role-appropriate views for operators, analysts, and executives",
      "Documentation and handover so your team owns it",
    ],
  },
] as const;

export function getCapability(slug: string): Capability | undefined {
  return capabilities.find((c) => c.slug === slug);
}
