/**
 * LootSignal case study content — SPEC.md §8.2, §14.
 * TODO(M3): CMS stand-in for Sanity's `caseStudy` schema. Field shapes match
 * §21 (stats carry required sourceType/asOf/confidence — §14.3).
 *
 * §14 guardrails applied: LootSignal is presented as an internally-built
 * research system; franchises are analysis subjects; no client names, logos,
 * or fabricated outcome metrics. Stats below are observable facts about the
 * system itself, not invented market results.
 */

export type SourceType = "observed" | "modeled" | "estimated";
export type Confidence = "high" | "medium" | "low";

export type Stat = {
  label: string;
  value: string;
  sourceType: SourceType;
  asOf: string; // ISO date
  confidence: Confidence;
};

export const lootSignal = {
  slug: "lootsignal",
  title: "LootSignal",
  eyebrow: "Case study · 52 franchises scored",
  question:
    "Which entertainment franchises deserve merchandise and licensing investment next — and in what order?",
  scope:
    "LootSignal is an internally-built research system that scores 52 entertainment franchises across seven weighted dimensions, so a licensing or merchandising decision starts from a comparable, current ranking instead of a one-off deck.",
  dimensions: [
    "Demand",
    "Fandom",
    "Design potential",
    "Licensing feasibility",
    "Audience fit",
    "Pricing power",
    "Market whitespace",
  ],
  stats: [
    {
      label: "Franchises scored",
      value: "52",
      sourceType: "observed",
      asOf: "2026-07-01",
      confidence: "high",
    },
    {
      label: "Scoring dimensions",
      value: "7",
      sourceType: "observed",
      asOf: "2026-07-01",
      confidence: "high",
    },
    {
      label: "Source classes ingested",
      value: "5",
      sourceType: "observed",
      asOf: "2026-07-01",
      confidence: "high",
    },
  ] satisfies Stat[],
  dataSources: [
    {
      name: "Search and interest trend data",
      cadence: "Weekly refresh",
      note: "Public interest signals, normalized per franchise.",
    },
    {
      name: "Social audience and engagement signals",
      cadence: "Weekly refresh",
      note: "Fandom size and engagement direction, not raw follower counts.",
    },
    {
      name: "Marketplace listing and pricing data",
      cadence: "Weekly refresh",
      note: "Merchandise breadth, price points, and sell-through proxies.",
    },
    {
      name: "Release and licensing calendars",
      cadence: "Monthly refresh",
      note: "Upcoming content that moves demand windows.",
    },
    {
      name: "Category market research",
      cadence: "Quarterly",
      note: "Licensed category-level context for whitespace estimates.",
    },
  ],
  dataNotAvailable:
    "Rights-holder internal sales data was not available and is not modeled. Where a dimension depends on it (pricing power in particular), the score uses marketplace proxies and is flagged at lower confidence.",
  formula:
    "franchise_score = Σ (dimension_score_i × weight_i)  where Σ weight_i = 1\n\ndimension_score_i ∈ [0,100], normalized within the 52-franchise set\nweights are explicit, adjustable, and versioned with each scoring run",
  features: [
    "Ranked franchise table with adjustable dimension weights",
    "Side-by-side franchise comparisons",
    "Demand-window forecasts tied to release calendars",
    "Category benchmarks",
    "Methodology documentation inside the product",
    "A data room with source lineage per figure",
  ],
  decisionsSupported: [
    "Which three franchises to pitch for licensed merchandise next quarter",
    "Which existing lines to expand, hold, or wind down",
    "When to time a launch against a franchise's next content window",
    "Which whitespace categories justify a licensing conversation",
  ],
  limitations: [
    "Scores are relative within the tracked set of 52 franchises; adding franchises re-normalizes the field.",
    "Pricing-power scores rely on marketplace proxies, not rights-holder sales data, and carry medium confidence at best.",
    "Demand-window forecasts assume announced release dates hold; slips are ingested on the next refresh, not predicted.",
    "The model ranks opportunities — it does not model licensing negotiation outcomes or contract economics.",
  ],
} as const;
