/**
 * Engagement bands — SPEC.md §8.4. Names and ranges are placeholders
 * pending Rick's confirmation (SPEC.md §25.3–4); ranges are indicative,
 * never fixed pricing.
 */

export type EngagementBand = {
  name: string;
  range: string;
  summary: string;
  includes: string[];
  typicalTimeline: string;
  scopeDrivers: string[];
};

export const engagementBands: readonly EngagementBand[] = [
  {
    name: "Focused Model",
    // TODO(copy): confirm band ranges with Rick before launch (SPEC §25.3).
    range: "Indicative range confirmed in discovery",
    summary:
      "One decision, one model, one working view. The fastest way to replace a load-bearing spreadsheet.",
    includes: [
      "Discovery and system definition",
      "One scoring or forecast model with documented methodology",
      "A focused dashboard on live data",
      "Handover documentation",
    ],
    typicalTimeline: "6–10 weeks",
    scopeDrivers: ["More than one data source needing automation", "Forecasting on top of scoring"],
  },
  {
    name: "Decision Platform",
    range: "Indicative range confirmed in discovery",
    summary:
      "A full decision system: automated ingestion, model, scenario views, and dashboards for more than one audience.",
    includes: [
      "Everything in Focused Model",
      "Automated multi-source ingestion with freshness monitoring",
      "Scenario comparison and alerting",
      "Role-based views and access control",
    ],
    typicalTimeline: "10–16 weeks",
    scopeDrivers: ["Live integrations into your systems of record", "Multiple business units or portfolios"],
  },
  {
    name: "Embedded System",
    range: "Indicative range confirmed in discovery",
    summary:
      "The platform plus an ongoing analytical partnership: model tuning, new decision modules, and quarterly methodology reviews.",
    includes: [
      "Everything in Decision Platform",
      "Ongoing model tuning against real decisions",
      "New modules as decisions expand",
      "Quarterly methodology and data-quality reviews",
    ],
    typicalTimeline: "Initial build 12–16 weeks, then quarterly cycles",
    scopeDrivers: ["API delivery into downstream tools", "Data-room and diligence workflows"],
  },
] as const;
