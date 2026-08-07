import { describe, expect, it } from "vitest";
import {
  ARCHETYPES,
  buildOutline,
  deriveDataPlan,
  deriveEffort,
  deriveRisks,
  selectArchetype,
} from "@/lib/planner/engine";
import type { PlannerInput } from "@/lib/planner/types";

const base: PlannerInput = {
  industry: "consumer_products",
  decision: "rank_opportunities",
  dataSources: ["internal_sales", "crm"],
  outputs: ["ranked_list", "exec_dashboard"],
  integrations: ["sheets"],
  timeline: "2-3mo",
};

describe("selectArchetype — all five archetype paths (SPEC §22 M4 accept)", () => {
  it("maps rank_opportunities to the Opportunity Ranking Engine", () => {
    expect(selectArchetype({ ...base, decision: "rank_opportunities" }).archetype.id).toBe(
      "opportunity_ranking",
    );
  });

  it("maps forecast_demand to the Demand Forecasting System", () => {
    expect(
      selectArchetype({ ...base, decision: "forecast_demand", outputs: ["forecast"] }).archetype.id,
    ).toBe("demand_forecasting");
  });

  it("maps monitor_competitors to the Competitive Monitoring Platform", () => {
    expect(
      selectArchetype({ ...base, decision: "monitor_competitors", outputs: ["alerts"] }).archetype.id,
    ).toBe("competitive_monitoring");
  });

  it("maps prioritize_portfolio and evaluate_risk to the Portfolio Decision Console", () => {
    expect(
      selectArchetype({ ...base, decision: "prioritize_portfolio", outputs: ["exec_dashboard"] })
        .archetype.id,
    ).toBe("portfolio_console");
    expect(
      selectArchetype({ ...base, decision: "evaluate_risk", outputs: ["exec_dashboard"] }).archetype.id,
    ).toBe("portfolio_console");
  });

  it("maps price_products to the Pricing & Margin Model", () => {
    expect(
      selectArchetype({ ...base, decision: "price_products", outputs: ["score_model"] }).archetype.id,
    ).toBe("pricing_margin");
  });

  it("returns low confidence for 'other' with weak output signal, high when signals align", () => {
    expect(selectArchetype({ ...base, decision: "other", outputs: ["exec_dashboard"] }).confidence).toBe(
      "low",
    );
    expect(
      selectArchetype({ ...base, decision: "rank_opportunities", outputs: ["ranked_list", "score_model"] })
        .confidence,
    ).toBe("high");
  });
});

describe("deriveDataPlan — both gap branches (SPEC §22 M4 accept)", () => {
  it("flags data assembly when sources include none_yet", () => {
    const plan = deriveDataPlan({ ...base, dataSources: ["none_yet"] });
    expect(plan.needsDataAssembly).toBe(true);
    expect(plan.gaps.length).toBeGreaterThan(0);
  });

  it("flags data assembly when sources are spreadsheets_only", () => {
    const plan = deriveDataPlan({ ...base, dataSources: ["spreadsheets_only"] });
    expect(plan.needsDataAssembly).toBe(true);
  });

  it("flags a missing time series for forecasting decisions", () => {
    const plan = deriveDataPlan({
      ...base,
      decision: "forecast_demand",
      dataSources: ["social_listening"],
    });
    expect(plan.gaps.some((g) => g.includes("time series"))).toBe(true);
  });

  it("reports no gaps for a well-sourced ranking input", () => {
    const plan = deriveDataPlan(base);
    expect(plan.needsDataAssembly).toBe(false);
    expect(plan.gaps).toHaveLength(0);
  });
});

describe("deriveEffort", () => {
  it("always returns phase bands, never a single number", () => {
    for (const phase of deriveEffort(base)) {
      expect(phase.weeksHigh).toBeGreaterThan(phase.weeksLow);
    }
  });

  it("extends discovery when data assembly is needed", () => {
    const withData = deriveEffort(base)[0];
    const withoutData = deriveEffort({ ...base, dataSources: ["none_yet"] })[0];
    expect(withoutData?.weeksHigh ?? 0).toBeGreaterThan(withData?.weeksHigh ?? 0);
  });
});

describe("deriveRisks", () => {
  it("surfaces the unrealistic-timeline risk for no data + 6-8wk", () => {
    const risks = deriveRisks({ ...base, dataSources: ["none_yet"], timeline: "6-8wk" });
    expect(risks.some((r) => r.includes("unrealistic"))).toBe(true);
  });

  it("surfaces integration-complexity risk above three live integrations", () => {
    const risks = deriveRisks({
      ...base,
      integrations: ["snowflake", "salesforce", "netsuite", "sftp"],
    });
    expect(risks.some((r) => r.toLowerCase().includes("integration"))).toBe(true);
  });

  it("is quiet for a clean input", () => {
    expect(deriveRisks(base)).toHaveLength(0);
  });
});

describe("buildOutline — determinism (SPEC §22 M4 accept)", () => {
  it("produces identical outlines for identical inputs", () => {
    const a = buildOutline(base);
    const b = buildOutline({ ...base });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("is complete without any enrichment: rationale, modules, plan, effort, assumptions", () => {
    const outline = buildOutline(base);
    expect(outline.rationale.length).toBeGreaterThan(40);
    expect(outline.modules.length).toBeGreaterThan(2);
    expect(outline.dashboardSections.length).toBeGreaterThan(0);
    expect(outline.effort).toHaveLength(4);
    expect(outline.assumptions.length).toBeGreaterThan(0);
  });

  it("covers every archetype's core modules from its own definition", () => {
    for (const archetype of ARCHETYPES) {
      expect(archetype.coreModules.length).toBeGreaterThan(0);
      expect(archetype.dashboardSections.length).toBeGreaterThan(0);
    }
  });
});
