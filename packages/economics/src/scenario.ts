import type { TitleEconomicsInputs } from "./waterfall.js";
import type { ContractComponent } from "./agreements.js";

/**
 * Scenario deltas (§6.4 scenario lab). Multipliers scale a baseline value;
 * absolute fields replace it. Everything here is an EXPLICIT user assumption
 * recorded with the scenario — never a system-invented default. A royalty
 * override only rewrites existing mapped ROYALTY components; it cannot
 * un-block an opportunity whose terms are unmapped.
 */
export interface ScenarioDeltas {
  /** Scales orders (sessions × conversion decompose in a later phase). */
  trafficMultiplier?: number;
  conversionMultiplier?: number;
  aovMultiplier?: number;
  discountsMultiplier?: number;
  cancellationsMultiplier?: number;
  refundsMultiplier?: number;
  variableCostsMultiplier?: number;
  /** Added to committed launch costs (e.g. incremental marketing), cents. */
  additionalCommittedCostsCents?: number;
  /** Absolute replacements. */
  guaranteeExposureCents?: number;
  royaltyRateBpsOverride?: number;
  pRightsWin?: number;
  delayDiscount?: number;
  capacityFeasibility?: number;
}

const MULTIPLIER_FIELDS = [
  "trafficMultiplier",
  "conversionMultiplier",
  "aovMultiplier",
  "discountsMultiplier",
  "cancellationsMultiplier",
  "refundsMultiplier",
  "variableCostsMultiplier",
] as const;

const UNIT_INTERVAL_FIELDS = ["pRightsWin", "delayDiscount", "capacityFeasibility"] as const;

export function validateScenarioDeltas(deltas: ScenarioDeltas): void {
  for (const field of MULTIPLIER_FIELDS) {
    const v = deltas[field];
    if (v !== undefined && (!Number.isFinite(v) || v < 0 || v > 100)) {
      throw new RangeError(`${field} must be a finite multiplier in [0, 100], got ${v}`);
    }
  }
  for (const field of UNIT_INTERVAL_FIELDS) {
    const v = deltas[field];
    if (v !== undefined && (!Number.isFinite(v) || v < 0 || v > 1)) {
      throw new RangeError(`${field} must be within [0, 1], got ${v}`);
    }
  }
  if (
    deltas.additionalCommittedCostsCents !== undefined &&
    (!Number.isSafeInteger(deltas.additionalCommittedCostsCents) || deltas.additionalCommittedCostsCents < 0)
  ) {
    throw new RangeError(`additionalCommittedCostsCents must be a non-negative integer of cents`);
  }
  if (
    deltas.guaranteeExposureCents !== undefined &&
    (!Number.isSafeInteger(deltas.guaranteeExposureCents) || deltas.guaranteeExposureCents < 0)
  ) {
    throw new RangeError(`guaranteeExposureCents must be a non-negative integer of cents`);
  }
  if (
    deltas.royaltyRateBpsOverride !== undefined &&
    (!Number.isSafeInteger(deltas.royaltyRateBpsOverride) ||
      deltas.royaltyRateBpsOverride < 0 ||
      deltas.royaltyRateBpsOverride > 10_000)
  ) {
    throw new RangeError(`royaltyRateBpsOverride must be an integer in [0, 10000]`);
  }
}

/**
 * Applies scenario deltas to baseline inputs, returning new inputs for
 * computeWaterfall. Pure; the baseline is never mutated. Cent values round
 * once, here, at the boundary.
 */
export function applyScenario(base: TitleEconomicsInputs, deltas: ScenarioDeltas): TitleEconomicsInputs {
  validateScenarioDeltas(deltas);

  const scale = (value: number, multiplier: number | undefined): number =>
    multiplier === undefined ? value : Math.round(value * multiplier);

  const ordersMultiplier = (deltas.trafficMultiplier ?? 1) * (deltas.conversionMultiplier ?? 1);

  const royaltyOverride = deltas.royaltyRateBpsOverride;
  const agreement =
    base.agreement === null || royaltyOverride === undefined
      ? base.agreement
      : {
          ...base.agreement,
          components: base.agreement.components?.map(
            (c): ContractComponent => (c.kind === "ROYALTY" ? { ...c, rateBps: royaltyOverride } : c)
          ),
        };

  return {
    storeActuals: {
      orders: Math.round(base.storeActuals.orders * ordersMultiplier),
      realizedAovCents: scale(base.storeActuals.realizedAovCents, deltas.aovMultiplier),
      currency: base.storeActuals.currency,
    },
    bridge: {
      discountsCents: scale(base.bridge.discountsCents, deltas.discountsMultiplier),
      cancellationsCents: scale(base.bridge.cancellationsCents, deltas.cancellationsMultiplier),
      refundsCents: scale(base.bridge.refundsCents, deltas.refundsMultiplier),
      chargebacksCents: base.bridge.chargebacksCents,
      excludedTaxesDutiesCents: base.bridge.excludedTaxesDutiesCents,
    },
    agreement,
    costs: {
      variableCostsCents: scale(base.costs.variableCostsCents, deltas.variableCostsMultiplier),
      committedLaunchCostsCents:
        base.costs.committedLaunchCostsCents + (deltas.additionalCommittedCostsCents ?? 0),
      guaranteeExposureCents: deltas.guaranteeExposureCents ?? base.costs.guaranteeExposureCents,
      writeDownsCents: base.costs.writeDownsCents,
    },
    pipeline: {
      pRightsWin: deltas.pRightsWin ?? base.pipeline.pRightsWin,
      delayDiscount: deltas.delayDiscount ?? base.pipeline.delayDiscount,
      capacityFeasibility: deltas.capacityFeasibility ?? base.pipeline.capacityFeasibility,
    },
  };
}
