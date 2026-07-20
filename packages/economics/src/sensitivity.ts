import { EconomicLayer } from "./layers.js";
import type { ContractComponent } from "./agreements.js";
import { computeWaterfall, type TitleEconomicsInputs } from "./waterfall.js";

/**
 * Sensitivity analysis (§5): which drivers move pipeline EV the most, and
 * where contribution breaks even. Everything is computed by re-running the
 * pure identities under perturbed inputs — no separate approximation model
 * that could drift from the real economics.
 *
 * Drivers from the spec list that the input model cannot express yet
 * (category mix, fulfillment route, service level) are reported in
 * `notModeled` — excluded WITH reasons, never silently dropped.
 */
export const SENSITIVITY_DRIVERS = [
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
] as const;

export type SensitivityDriver = (typeof SENSITIVITY_DRIVERS)[number];

export const NOT_MODELED_DRIVERS = [
  { driver: "category_mix", reason: "input model has no category grain yet (arrives with store_weeks-backed forecasts)" },
  { driver: "fulfillment_route", reason: "routing optimizer lands in Phase 2; no route cost model yet" },
  { driver: "service_level", reason: "service-risk penalties land with the routing optimizer in Phase 2" },
] as const;

export interface DriverSensitivity {
  driver: SensitivityDriver;
  /** EV(driver × 1.1) − EV(baseline), in cents (layer PIPELINE_EV). */
  evDeltaUpCents: number;
  /** EV(driver × 0.9) − EV(baseline), in cents (layer PIPELINE_EV). */
  evDeltaDownCents: number;
  /** Driver multiplier at which FYUL_CONTRIBUTION crosses zero, if it does within [0, 10]. */
  breakEvenMultiplier: number | null;
  breakEvenNote: string | null;
}

export type SensitivityReport =
  | {
      status: "OK";
      topDrivers: DriverSensitivity[];
      allDrivers: DriverSensitivity[];
      notModeled: typeof NOT_MODELED_DRIVERS;
    }
  | { status: "TERMS_UNMAPPED"; detail: string };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Applies a multiplicative shock to one driver. Pure. */
export function perturbDriver(
  base: TitleEconomicsInputs,
  driver: SensitivityDriver,
  multiplier: number
): TitleEconomicsInputs {
  if (!Number.isFinite(multiplier) || multiplier < 0) {
    throw new RangeError(`multiplier must be finite and >= 0, got ${multiplier}`);
  }
  const m = multiplier;
  switch (driver) {
    case "traffic":
    case "conversion":
      return {
        ...base,
        storeActuals: { ...base.storeActuals, orders: Math.round(base.storeActuals.orders * m) },
      };
    case "aov":
      return {
        ...base,
        storeActuals: {
          ...base.storeActuals,
          realizedAovCents: Math.round(base.storeActuals.realizedAovCents * m),
        },
      };
    case "returns":
      return {
        ...base,
        bridge: { ...base.bridge, refundsCents: Math.round(base.bridge.refundsCents * m) },
      };
    case "variable_costs":
      return {
        ...base,
        costs: { ...base.costs, variableCostsCents: Math.round(base.costs.variableCostsCents * m) },
      };
    case "royalty_rate": {
      if (base.agreement === null) return base;
      return {
        ...base,
        agreement: {
          ...base.agreement,
          components: base.agreement.components?.map(
            (c): ContractComponent =>
              c.kind === "ROYALTY" && c.rateBps !== undefined
                ? { ...c, rateBps: Math.min(10_000, Math.round(c.rateBps * m)) }
                : c
          ),
        },
      };
    }
    case "guarantee":
      return {
        ...base,
        costs: {
          ...base.costs,
          guaranteeExposureCents: Math.round(base.costs.guaranteeExposureCents * m),
        },
      };
    case "marketing_committed":
      return {
        ...base,
        costs: {
          ...base.costs,
          committedLaunchCostsCents: Math.round(base.costs.committedLaunchCostsCents * m),
        },
      };
    case "launch_delay":
      return {
        ...base,
        pipeline: { ...base.pipeline, delayDiscount: clamp01(base.pipeline.delayDiscount * m) },
      };
    case "p_rights_win":
      return {
        ...base,
        pipeline: { ...base.pipeline, pRightsWin: clamp01(base.pipeline.pRightsWin * m) },
      };
    case "capacity":
      return {
        ...base,
        pipeline: {
          ...base.pipeline,
          capacityFeasibility: clamp01(base.pipeline.capacityFeasibility * m),
        },
      };
  }
}

const PIPELINE_ONLY: ReadonlySet<SensitivityDriver> = new Set([
  "launch_delay",
  "p_rights_win",
  "capacity",
]);

function contributionAt(base: TitleEconomicsInputs, driver: SensitivityDriver, m: number): number {
  const result = computeWaterfall(perturbDriver(base, driver, m));
  if (result.status !== "OK") throw new Error("sensitivity requires mapped terms");
  return result.layers[EconomicLayer.FYUL_CONTRIBUTION].amountCents;
}

/**
 * Bisection for the driver multiplier where contribution crosses zero.
 * Returns null (with the caller noting why) when there is no sign change in
 * [lo, hi] — e.g. the launch is profitable across the whole plausible range.
 */
function findBreakEven(
  base: TitleEconomicsInputs,
  driver: SensitivityDriver,
  lo = 0,
  hi = 10
): number | null {
  let fLo = contributionAt(base, driver, lo);
  const fHi = contributionAt(base, driver, hi);
  if (fLo === 0) return lo;
  if (fHi === 0) return hi;
  if (Math.sign(fLo) === Math.sign(fHi)) return null;
  for (let i = 0; i < 60 && hi - lo > 1e-4; i++) {
    const mid = (lo + hi) / 2;
    const fMid = contributionAt(base, driver, mid);
    if (fMid === 0) return mid;
    if (Math.sign(fMid) === Math.sign(fLo)) {
      lo = mid;
      fLo = fMid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

export function computeSensitivity(base: TitleEconomicsInputs): SensitivityReport {
  const baseline = computeWaterfall(base);
  if (baseline.status !== "OK") {
    return {
      status: "TERMS_UNMAPPED",
      detail:
        "Sensitivity requires mapped deal terms: contribution drivers cannot be computed " +
        "without contract-defined recognized components. No default take rate exists.",
    };
  }
  const baseEv = baseline.layers[EconomicLayer.PIPELINE_EV].amountCents;

  const evAt = (driver: SensitivityDriver, m: number): number => {
    const result = computeWaterfall(perturbDriver(base, driver, m));
    if (result.status !== "OK") throw new Error("perturbation must not unmap terms");
    return result.layers[EconomicLayer.PIPELINE_EV].amountCents;
  };

  const allDrivers: DriverSensitivity[] = SENSITIVITY_DRIVERS.map((driver) => {
    const pipelineOnly = PIPELINE_ONLY.has(driver);
    return {
      driver,
      evDeltaUpCents: evAt(driver, 1.1) - baseEv,
      evDeltaDownCents: evAt(driver, 0.9) - baseEv,
      breakEvenMultiplier: pipelineOnly ? null : findBreakEven(base, driver),
      breakEvenNote: pipelineOnly
        ? "scales EV only; does not affect FYUL contribution, so no contribution break-even exists"
        : null,
    };
  });

  const topDrivers = [...allDrivers]
    .sort(
      (a, b) =>
        Math.max(Math.abs(b.evDeltaUpCents), Math.abs(b.evDeltaDownCents)) -
        Math.max(Math.abs(a.evDeltaUpCents), Math.abs(a.evDeltaDownCents))
    )
    .slice(0, 5);

  return { status: "OK", topDrivers, allDrivers, notModeled: NOT_MODELED_DRIVERS };
}
