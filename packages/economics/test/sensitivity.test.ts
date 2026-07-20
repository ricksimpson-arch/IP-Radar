import { describe, expect, it } from "vitest";
import {
  EconomicLayer,
  computeSensitivity,
  computeWaterfall,
  perturbDriver,
  type TitleEconomicsInputs,
} from "../src/index.js";

const BASELINE: TitleEconomicsInputs = {
  storeActuals: { orders: 12_400, realizedAovCents: 3_250, currency: "USD" },
  bridge: {
    discountsCents: 2_015_000,
    cancellationsCents: 806_000,
    refundsCents: 1_612_000,
    chargebacksCents: 161_200,
    excludedTaxesDutiesCents: 3_224_000,
  },
  agreement: {
    agreementId: "AGR-DEMO-1",
    version: 3,
    currency: "USD",
    components: [
      { kind: "ROYALTY", rateBps: 1_200, baseLayer: EconomicLayer.STORE_NET_SALES },
      { kind: "SERVICE_FEE_FIXED", amountCents: 500_000 },
    ],
  },
  costs: {
    variableCostsCents: 1_000_000,
    committedLaunchCostsCents: 750_000,
    guaranteeExposureCents: 250_000,
    writeDownsCents: 100_000,
  },
  pipeline: { pRightsWin: 0.6, delayDiscount: 0.9, capacityFeasibility: 0.95 },
};

describe("computeSensitivity", () => {
  const report = computeSensitivity(BASELINE);
  if (report.status !== "OK") throw new Error("expected OK report for mapped baseline");

  it("returns exactly 5 top drivers ranked by absolute EV impact", () => {
    expect(report.topDrivers).toHaveLength(5);
    const impacts = report.topDrivers.map((d) =>
      Math.max(Math.abs(d.evDeltaUpCents), Math.abs(d.evDeltaDownCents))
    );
    expect([...impacts].sort((a, b) => b - a)).toEqual(impacts);
  });

  it("driver directions are economically correct", () => {
    const byKey = Object.fromEntries(report.allDrivers.map((d) => [d.driver, d]));
    // More traffic / higher AOV / higher royalty rate (FYUL income) raise EV.
    expect(byKey.traffic!.evDeltaUpCents).toBeGreaterThan(0);
    expect(byKey.aov!.evDeltaUpCents).toBeGreaterThan(0);
    expect(byKey.royalty_rate!.evDeltaUpCents).toBeGreaterThan(0);
    // More returns / variable cost / guarantee exposure lower EV.
    expect(byKey.returns!.evDeltaUpCents).toBeLessThan(0);
    expect(byKey.variable_costs!.evDeltaUpCents).toBeLessThan(0);
    expect(byKey.guarantee!.evDeltaUpCents).toBeLessThan(0);
    // A worse launch delay (lower discount) lowers EV.
    expect(byKey.launch_delay!.evDeltaDownCents).toBeLessThan(0);
  });

  it("finds the variable-cost break-even by re-running the real identities", () => {
    const vc = report.allDrivers.find((d) => d.driver === "variable_costs")!;
    // Contribution 2,297,816 at m=1 with variable costs 1,000,000:
    // zero at m = 1 + 2,297,816/1,000,000 = 3.297816.
    expect(vc.breakEvenMultiplier).not.toBeNull();
    expect(vc.breakEvenMultiplier!).toBeCloseTo(3.2978, 3);
  });

  it("pipeline-only drivers report no contribution break-even, with a reason", () => {
    const p = report.allDrivers.find((d) => d.driver === "p_rights_win")!;
    expect(p.breakEvenMultiplier).toBeNull();
    expect(p.breakEvenNote).toContain("does not affect FYUL contribution");
  });

  it("discloses unmodeled spec drivers instead of dropping them silently", () => {
    const names = report.notModeled.map((d) => d.driver);
    expect(names).toEqual(["category_mix", "fulfillment_route", "service_level"]);
    for (const d of report.notModeled) expect(d.reason).toBeTruthy();
  });

  it("blocks sensitivity for unmapped terms", () => {
    const result = computeSensitivity({ ...BASELINE, agreement: null });
    expect(result.status).toBe("TERMS_UNMAPPED");
  });
});

describe("perturbDriver", () => {
  it("is pure and does not mutate the baseline", () => {
    const snapshot = JSON.parse(JSON.stringify(BASELINE));
    perturbDriver(BASELINE, "royalty_rate", 1.5);
    perturbDriver(BASELINE, "traffic", 0.5);
    expect(BASELINE).toEqual(snapshot);
  });

  it("multiplier 1 reproduces the baseline waterfall exactly for every driver", () => {
    const base = computeWaterfall(BASELINE);
    for (const driver of [
      "traffic",
      "conversion",
      "aov",
      "returns",
      "variable_costs",
      "royalty_rate",
      "guarantee",
      "marketing_committed",
      "launch_delay",
      "p_rights_win",
      "capacity",
    ] as const) {
      expect(computeWaterfall(perturbDriver(BASELINE, driver, 1))).toEqual(base);
    }
  });

  it("rejects negative multipliers", () => {
    expect(() => perturbDriver(BASELINE, "traffic", -1)).toThrowError(RangeError);
  });
});
