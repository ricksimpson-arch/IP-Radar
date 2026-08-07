/**
 * Method phases and analytical standards — SPEC.md §8.3.
 * TODO(M3): CMS stand-in for Sanity `methodPhase` and `standard` schemas.
 */

export type MethodPhase = {
  number: number;
  title: string;
  whatHappens: string;
  clientProvides: string;
  clientReceives: string;
  durationBand: string;
};

export const methodPhases: readonly MethodPhase[] = [
  {
    number: 1,
    title: "Discovery",
    whatHappens:
      "We pin the system to one or more named, recurring decisions, inventory your data sources, and agree the scoring or forecasting approach in plain terms before anything is built.",
    clientProvides:
      "A decision owner for weekly sessions, access to the data landscape, and honesty about what data doesn't exist.",
    clientReceives:
      "A written system definition: decisions supported, dimensions, sources, gaps, and a phased plan with week bands.",
    durationBand: "1–2 weeks (2–4 if data assembly is needed)",
  },
  {
    number: 2,
    title: "Research & Modeling",
    whatHappens:
      "We build and validate the model — scoring dimensions, weights, forecast structure — with your team in the loop. Formulas are readable, assumptions are documented as we go.",
    clientProvides: "Domain review of draft scores and assumptions; source credentials.",
    clientReceives:
      "A working model with a methodology document, run against your real data, before platform work begins.",
    durationBand: "2–5 weeks",
  },
  {
    number: 3,
    title: "Platform Development",
    whatHappens:
      "The model becomes a product: ingestion on a schedule, dashboards shaped around the decisions, alerting where it earns its place, and the methodology published inside the tool.",
    clientProvides: "Feedback on working software in weekly reviews.",
    clientReceives: "The platform, running on live data, with documentation and access controls.",
    durationBand: "3–8 weeks",
  },
  {
    number: 4,
    title: "Launch & Improvement",
    whatHappens:
      "We launch with your team, watch how the system is actually used, tune weights and views against real decisions, and hand over ownership.",
    clientProvides: "Real decisions run through the system.",
    clientReceives: "Tuning, training, a runbook, and a defined improvement cadence.",
    durationBand: "1–2 weeks, then ongoing as agreed",
  },
] as const;

export type Standard = {
  title: string;
  description: string;
  exampleInSystem: string;
};

export const standards: readonly Standard[] = [
  {
    title: "Transparent formulas",
    description: "Every score and forecast has a readable formula. No black boxes.",
    exampleInSystem:
      "In LootSignal, the franchise score formula and its weights are published inside the product, and every scoring run is versioned.",
  },
  {
    title: "Traceable sources",
    description: "Every figure links back to where it came from.",
    exampleInSystem:
      "Each dashboard figure carries a source tag; clicking through shows the source class, refresh date, and ingestion path.",
  },
  {
    title: "Confidence scores",
    description: "Figures state how much weight they can bear.",
    exampleInSystem:
      "Dimensions that rely on proxy data are chip-marked medium or low confidence, and the chip explains why.",
  },
  {
    title: "Data-freshness monitoring",
    description: "Stale data is flagged, not silently served.",
    exampleInSystem:
      "Every panel shows its last refresh; a source that misses its cadence turns its dependent figures amber.",
  },
  {
    title: "Observed vs. modeled separation",
    description: "History and projection are never drawn as the same line.",
    exampleInSystem:
      "Forecast charts render observed history as a solid series and modeled futures as banded ranges with the assumption set named.",
  },
  {
    title: "Documented assumptions and limitations",
    description: "Every model ships with what it can't do.",
    exampleInSystem:
      "The methodology page lists assumptions and limitations, and the list is updated when the model changes — it's part of the deliverable.",
  },
  {
    title: "Secure handling of client data",
    description: "Least-privilege access, encryption, defined retention.",
    exampleInSystem:
      "Client data is encrypted in transit and at rest, access is role-scoped and logged, and retention windows are agreed in writing.",
  },
] as const;
