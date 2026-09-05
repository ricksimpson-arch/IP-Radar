/**
 * SnowFlurry case study content — SPEC.md §8.2, §14.
 * TODO(M3): CMS stand-in for Sanity's `caseStudy` schema, like caseStudy.ts.
 *
 * Every fact below is sourced from the SnowFlurry repository itself
 * (README, src/lib/scoring.ts, src/lib/sources.ts, db/seed/shows.psv) —
 * an internally-built research system, presented per §14 with no client
 * claims and no fabricated outcome metrics. Series names are analysis
 * subjects and are not listed on the marketing site.
 */
import type { Stat } from "./caseStudy";

export const snowFlurry = {
  slug: "snowflurry",
  title: "SnowFlurry",
  eyebrow: "Case study · 300 series scored",
  question:
    "Which television series are worth a licensing conversation this quarter — and what is the evidence?",
  scope:
    "SnowFlurry is an internally-built decision-intelligence dashboard that ranks a 300-series baseline catalogue by physical-merchandise and licensing opportunity. Nine raw signals per series feed six weighted criteria plus a confidence score; every rank is recomputed by an automated weekly run, so the licensing team starts each Monday from a current, comparable field instead of a stale deck.",
  criteria: [
    { name: "Raw Demand", weight: "26%", basis: "Reach, engagement, and search-trend index" },
    { name: "Actionability", weight: "20%", basis: "Rights clarity, licensor receptivity, release window" },
    { name: "Whitespace", weight: "14%", basis: "Demand minus current merchandise supply" },
    { name: "Visual", weight: "14%", basis: "Iconicity and toyetic potential" },
    { name: "Licensing", weight: "14%", basis: "Receptivity, rights clarity, licensing-program evidence" },
    { name: "Momentum", weight: "12%", basis: "Trend index and release cadence" },
  ],
  stats: [
    {
      label: "Series in the baseline catalogue",
      value: "300",
      sourceType: "observed",
      asOf: "2026-09-05",
      confidence: "high",
    },
    {
      label: "Raw signals per series",
      value: "9",
      sourceType: "observed",
      asOf: "2026-09-05",
      confidence: "high",
    },
    {
      label: "Weighted criteria + confidence score",
      value: "6+1",
      sourceType: "observed",
      asOf: "2026-09-05",
      confidence: "high",
    },
  ] satisfies Stat[],
  /** The automation-honesty story: each signal source carries a badge for how
      automated it actually is — published inside the product itself. */
  dataSources: [
    {
      name: "Title catalogue metadata",
      automation: "Automated",
      note: "Refreshed by the weekly job with no human involved.",
    },
    {
      name: "Search interest and streaming top-10 charts",
      automation: "Semi-automated",
      note: "Pulled weekly where the endpoint allows; the previous value is carried forward, and flagged, when it does not.",
    },
    {
      name: "Public social and community footprints",
      automation: "Semi-automated",
      note: "Fandom size and engagement direction, refreshed on the same cadence.",
    },
    {
      name: "Licensing desk research, design review, ratings reconciliation, storefront checks",
      automation: "Manual research",
      note: "Analyst judgement on a research cadence — and the product says so on every figure they feed.",
    },
    {
      name: "Commercial demand-measurement feeds",
      automation: "Not yet connected",
      note: "Sources the system would use under a data contract, listed openly rather than silently imitated.",
    },
  ],
  dataNotAvailable:
    "Reach, engagement, licensing, and visual scores are SnowFlurry's own indices, not figures licensed from a measurement vendor — the product names the source family each index was reconciled against instead of attributing invented numbers to a provider it doesn't subscribe to. Storefront links read 'Needs check' until a person verifies them, with who and when recorded; 'Needs check' is never displayed as 'no store exists'.",
  formula:
    "series_score = Σ (criterion_i × weight_i) × (0.95 + 0.05 × confidence/100)\n\nraw_demand    (26%) = 0.55·reach + 0.30·engagement + 0.15·trend_index\nactionability (20%) = 0.40·rights_clarity + 0.35·licensor_receptivity + 0.25·window_score\nwhitespace    (14%) = 50 + 0.85·(raw_demand − merch_supply)\nvisual        (14%) = 0.55·iconicity + 0.45·toyetic\nlicensing     (14%) = 0.40·licensor_receptivity + 0.30·rights_clarity + 0.30·program_evidence\nmomentum      (12%) = 0.70·trend_index + 0.30·cadence_score\n\nconfidence = 0.75·data_quality + 0.25·stability",
  formulaNote:
    "The confidence multiplier is a haircut of up to 5% where the data is thin. Whitespace and Licensing deliberately move in opposite directions on merchandise supply: a saturated category leaves nothing to take, but it proves the rights holder can transact. The engine is pure and deterministic — it never reads a previous score, so every re-run is reproducible and historical runs stay comparable.",
  features: [
    "Sortable, filterable rankings with all seven ranks and spreadsheet export",
    "Per-series profiles: score-contribution waterfall, cited evidence, risks, seasonality, comparables",
    "Automated weekly refresh writing one immutable score row per series, preserving week-over-week movement",
    "Human-verified commerce links with who-verified-and-when recorded",
    "Methodology page inside the product: every formula, source, and automation level",
    "Invite-based access control with an activity log",
  ],
  decisionsSupported: [
    "Which series justify a licensing conversation this quarter, with the evidence attached",
    "Whether a category's whitespace justifies entering it at all",
    "When to time outreach against a series' next release window",
    "Which signals need human verification before a pitch meeting",
  ],
  limitations: [
    "Scores are directional research estimates for prioritising outreach — not forecasts of sales, and not guarantees that a deal will close.",
    "Several inputs are analyst judgement on a research cadence; the product labels exactly which, per source.",
    "Demand indices are internally built and reconciled against public source families, not licensed vendor measurements.",
    "Semi-automated signals carry forward their previous value when an endpoint fails, and are flagged when they do.",
  ],
} as const;
