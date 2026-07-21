import { describe, expect, it } from "vitest";
import { recommendRoute, type RouteCandidate, type RoutingWeights } from "../src/index.js";

const WEIGHTS: RoutingWeights = {
  delayPenaltyCentsPerDay: 50_000,
  qualityMissPenaltyCents: 2_000_000,
  stockoutPenaltyCents: 1_500_000,
  concentrationPenaltyCents: 800_000,
  providerDataFreshnessSlaDays: 14,
};

function makeCandidate(overrides: Partial<RouteCandidate>): RouteCandidate {
  return {
    routeId: "route",
    providers: ["snow"],
    expectedContributionCents: 5_000_000,
    unitCostCents: 900,
    capacityUnitsPerWeek: 10_000,
    requiredUnitsPerWeek: 5_000,
    complianceEligible: true,
    dataAgeDays: 3,
    expectedDelayDays: 2,
    qualityScore: 0.95,
    stockoutRisk: 0.05,
    providerConcentration: 0.5,
    ...overrides,
  };
}

describe("recommendRoute (TS twin of the Python scorer)", () => {
  it("lowest unit cost is not automatically optimal", () => {
    const cheapButRisky = makeCandidate({
      routeId: "printify-led",
      providers: ["printify"],
      unitCostCents: 600,
      expectedContributionCents: 5_200_000,
      expectedDelayDays: 12,
      qualityScore: 0.7,
      stockoutRisk: 0.4,
      providerConcentration: 0.9,
    });
    const pricierReliable = makeCandidate({
      routeId: "snow-full-service",
      unitCostCents: 1_100,
      expectedContributionCents: 4_800_000,
      expectedDelayDays: 1,
      qualityScore: 0.97,
      stockoutRisk: 0.03,
      providerConcentration: 0.4,
    });
    const rec = recommendRoute([cheapButRisky, pricierReliable], WEIGHTS);
    expect(rec.recommended?.routeId).toBe("snow-full-service");
    expect(cheapButRisky.unitCostCents).toBeLessThan(pricierReliable.unitCostCents);
  });

  it("excludes infeasible routes with reasons, never silently", () => {
    const rec = recommendRoute(
      [
        makeCandidate({ routeId: "no-capacity", capacityUnitsPerWeek: 100 }),
        makeCandidate({
          routeId: "not-compliant",
          complianceEligible: false,
          complianceReason: "missing EU market certificate",
        }),
        makeCandidate({ routeId: "stale-data", dataAgeDays: 45 }),
        makeCandidate({ routeId: "ok-route" }),
      ],
      WEIGHTS
    );
    expect(rec.ranked.map((r) => r.routeId)).toEqual(["ok-route"]);
    const excluded = Object.fromEntries(rec.excluded.map((e) => [e.routeId, e.reasons]));
    expect(excluded["no-capacity"]![0]).toContain("insufficient capacity");
    expect(excluded["not-compliant"]![0]).toContain("missing EU market certificate");
    expect(excluded["stale-data"]![0]).toContain("stale provider data");
  });

  it("returns no recommendation when nothing is feasible", () => {
    const rec = recommendRoute([makeCandidate({ routeId: "stale", dataAgeDays: 99 })], WEIGHTS);
    expect(rec.recommended).toBeNull();
    expect(rec.ranked).toEqual([]);
    expect(rec.excluded).toHaveLength(1);
  });

  it("matches the Python implementation on a shared fixture", () => {
    // Same numbers as services/forecast/tests/test_routing.py::make_candidate —
    // score = 5,000,000 − (2×50,000 + 0.05×2,000,000 + 0.05×1,500,000 + 0.5×800,000)
    //       = 5,000,000 − (100,000 + 100,000 + 75,000 + 400,000) = 4,325,000
    const rec = recommendRoute([makeCandidate({ routeId: "r1" })], WEIGHTS);
    expect(rec.recommended?.scoreCents).toBe(4_325_000);
    expect(rec.recommended?.scoreLayer).toBe("FYUL_CONTRIBUTION");
  });
});
