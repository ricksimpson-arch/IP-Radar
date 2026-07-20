import { describe, expect, it } from "vitest";
import {
  EconomicLayer,
  applyScenario,
  computeWaterfall,
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

const UNMAPPED: TitleEconomicsInputs = { ...BASELINE, agreement: null };

describe("computeWaterfall", () => {
  it("matches the golden fixture values for the mapped baseline", () => {
    const result = computeWaterfall(BASELINE);
    expect(result.status).toBe("OK");
    if (result.status !== "OK") throw new Error("unreachable");
    expect(result.layers[EconomicLayer.CONSUMER_GMS].amountCents).toBe(40_300_000);
    expect(result.layers[EconomicLayer.STORE_NET_SALES].amountCents).toBe(32_481_800);
    expect(result.layers[EconomicLayer.FYUL_RECOGNIZED].amountCents).toBe(4_397_816);
    expect(result.layers[EconomicLayer.FYUL_CONTRIBUTION].amountCents).toBe(2_297_816);
    expect(result.layers[EconomicLayer.PIPELINE_EV].amountCents).toBe(1_178_780);
  });

  it("returns store layers only with TERMS_UNMAPPED status when terms are missing", () => {
    const result = computeWaterfall(UNMAPPED);
    expect(result.status).toBe("TERMS_UNMAPPED");
    if (result.status !== "TERMS_UNMAPPED") throw new Error("unreachable");
    expect(Object.keys(result.layers).sort()).toEqual(["CONSUMER_GMS", "STORE_NET_SALES"]);
  });
});

describe("applyScenario", () => {
  it("empty deltas reproduce the baseline exactly (identity)", () => {
    expect(computeWaterfall(applyScenario(BASELINE, {}))).toEqual(computeWaterfall(BASELINE));
  });

  it("does not mutate the baseline", () => {
    const snapshot = JSON.parse(JSON.stringify(BASELINE));
    applyScenario(BASELINE, { trafficMultiplier: 2, royaltyRateBpsOverride: 500 });
    expect(BASELINE).toEqual(snapshot);
  });

  it("traffic and conversion multipliers compound on orders", () => {
    const scenario = applyScenario(BASELINE, { trafficMultiplier: 1.1, conversionMultiplier: 1.2 });
    expect(scenario.storeActuals.orders).toBe(Math.round(12_400 * 1.1 * 1.2));
  });

  it("higher traffic raises pipeline EV; a launch delay lowers it", () => {
    const base = computeWaterfall(BASELINE);
    const up = computeWaterfall(applyScenario(BASELINE, { trafficMultiplier: 1.2 }));
    const delayed = computeWaterfall(applyScenario(BASELINE, { delayDiscount: 0.6 }));
    if (base.status !== "OK" || up.status !== "OK" || delayed.status !== "OK") {
      throw new Error("expected OK results");
    }
    const ev = (r: typeof base) => r.layers[EconomicLayer.PIPELINE_EV].amountCents;
    expect(ev(up)).toBeGreaterThan(ev(base));
    expect(ev(delayed)).toBeLessThan(ev(base));
  });

  it("royalty override rewrites only ROYALTY components", () => {
    const scenario = applyScenario(BASELINE, { royaltyRateBpsOverride: 600 });
    const result = computeWaterfall(scenario);
    if (result.status !== "OK") throw new Error("expected OK");
    // 6.00% × 32,481,800 = 1,948,908; + fixed 500,000 = 2,448,908
    expect(result.layers[EconomicLayer.FYUL_RECOGNIZED].amountCents).toBe(2_448_908);
  });

  it("a royalty override cannot un-block unmapped terms", () => {
    const result = computeWaterfall(applyScenario(UNMAPPED, { royaltyRateBpsOverride: 1_000 }));
    expect(result.status).toBe("TERMS_UNMAPPED");
  });

  it("rejects invalid multipliers and probabilities", () => {
    expect(() => applyScenario(BASELINE, { trafficMultiplier: -1 })).toThrowError(RangeError);
    expect(() => applyScenario(BASELINE, { pRightsWin: 1.5 })).toThrowError(RangeError);
    expect(() => applyScenario(BASELINE, { additionalCommittedCostsCents: 10.5 })).toThrowError(
      RangeError
    );
    expect(() => applyScenario(BASELINE, { royaltyRateBpsOverride: 20_000 })).toThrowError(RangeError);
  });
});
