import type { AgreementVersion } from "@ip-radar/economics";

/**
 * Synthetic demo opportunities used until real sources are connected
 * (Phase 0 explicitly excludes real data). Values mirror the golden fixtures
 * in packages/economics — they are NOT real deal terms.
 */
export interface DemoOpportunity {
  id: string;
  title: string;
  storeActuals: { orders: number; realizedAovCents: number; currency: string };
  bridge: {
    discountsCents: number;
    cancellationsCents: number;
    refundsCents: number;
    chargebacksCents: number;
    excludedTaxesDutiesCents: number;
  };
  agreement: AgreementVersion | null;
  costs: {
    variableCostsCents: number;
    committedLaunchCostsCents: number;
    guaranteeExposureCents: number;
    writeDownsCents: number;
  };
  pipeline: { pRightsWin: number; delayDiscount: number; capacityFeasibility: number };
}

const DEMO: Record<string, DemoOpportunity> = {
  "demo-mapped": {
    id: "demo-mapped",
    title: "Demo title with fully mapped terms",
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
        { kind: "ROYALTY", rateBps: 1_200, baseLayer: "STORE_NET_SALES" },
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
  },
  "demo-unmapped": {
    id: "demo-unmapped",
    title: "Demo title with unmapped terms (store layers only)",
    storeActuals: { orders: 5_000, realizedAovCents: 2_000, currency: "USD" },
    bridge: {
      discountsCents: 500_000,
      cancellationsCents: 200_000,
      refundsCents: 300_000,
      chargebacksCents: 0,
      excludedTaxesDutiesCents: 800_000,
    },
    agreement: null,
    costs: {
      variableCostsCents: 0,
      committedLaunchCostsCents: 0,
      guaranteeExposureCents: 0,
      writeDownsCents: 0,
    },
    pipeline: { pRightsWin: 0.35, delayDiscount: 0.85, capacityFeasibility: 1 },
  },
};

export function getDemoOpportunity(id: string): DemoOpportunity | undefined {
  return DEMO[id];
}
