import { EconomicLayer, type TitleEconomicsInputs } from "@ip-radar/economics";

/**
 * Synthetic demo opportunities shared by the API and web surfaces until real
 * sources are connected (Phase 0 excludes real data). Every title,
 * rightsholder, and number here is FICTIONAL — none of these are real IPs or
 * deal terms. The set is deliberately shaped so that GMV ranking and
 * pipeline-EV ranking disagree (the whole point of the platform).
 */
export interface DemoOpportunity {
  id: string;
  title: string;
  rightsholder: string;
  owner: string;
  status: "PROSPECT" | "QUALIFIED" | "IN_NEGOTIATION" | "WON";
  ipArchetype: string;
  economics: TitleEconomicsInputs;
}

const OPPORTUNITIES: readonly DemoOpportunity[] = [
  {
    id: "demo-mapped",
    title: "Starfall Chronicles (fictional demo)",
    rightsholder: "Meteorite Pictures (fictional)",
    owner: "demo.owner",
    status: "IN_NEGOTIATION",
    ipArchetype: "franchise-film",
    economics: {
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
    },
  },
  {
    id: "demo-nebula-saga",
    title: "Nebula Saga: Rebellion (fictional demo)",
    rightsholder: "Orbit & Anchor Media (fictional)",
    owner: "demo.owner",
    status: "IN_NEGOTIATION",
    ipArchetype: "streaming-series",
    economics: {
      storeActuals: { orders: 40_000, realizedAovCents: 3_500, currency: "USD" },
      bridge: {
        discountsCents: 14_000_000,
        cancellationsCents: 4_000_000,
        refundsCents: 7_000_000,
        chargebacksCents: 700_000,
        excludedTaxesDutiesCents: 11_200_000,
      },
      agreement: {
        agreementId: "AGR-DEMO-NEBULA",
        version: 1,
        currency: "USD",
        components: [
          { kind: "ROYALTY", rateBps: 1_500, baseLayer: EconomicLayer.STORE_NET_SALES },
          { kind: "SERVICE_FEE_FIXED", amountCents: 1_000_000 },
        ],
      },
      costs: {
        variableCostsCents: 6_000_000,
        committedLaunchCostsCents: 2_500_000,
        guaranteeExposureCents: 1_500_000,
        writeDownsCents: 500_000,
      },
      pipeline: { pRightsWin: 0.7, delayDiscount: 0.95, capacityFeasibility: 0.9 },
    },
  },
  {
    id: "demo-galactic-bake-off",
    title: "Galactic Bake-Off (fictional demo)",
    rightsholder: "Supernova Unscripted (fictional)",
    owner: "demo.owner",
    status: "PROSPECT",
    ipArchetype: "reality-competition",
    economics: {
      // Highest GMS in the demo set — and one of the WORST pipeline EVs.
      // High royalty on a GMS base, thin contribution, low P(rights win).
      storeActuals: { orders: 60_000, realizedAovCents: 3_000, currency: "USD" },
      bridge: {
        discountsCents: 27_000_000,
        cancellationsCents: 9_000_000,
        refundsCents: 18_000_000,
        chargebacksCents: 1_800_000,
        excludedTaxesDutiesCents: 14_400_000,
      },
      agreement: {
        agreementId: "AGR-DEMO-BAKEOFF",
        version: 2,
        currency: "USD",
        components: [{ kind: "ROYALTY", rateBps: 2_500, baseLayer: EconomicLayer.CONSUMER_GMS }],
      },
      costs: {
        variableCostsCents: 28_000_000,
        committedLaunchCostsCents: 5_000_000,
        guaranteeExposureCents: 8_000_000,
        writeDownsCents: 2_000_000,
      },
      pipeline: { pRightsWin: 0.15, delayDiscount: 0.8, capacityFeasibility: 0.85 },
    },
  },
  {
    id: "demo-clockwork-detective",
    title: "The Clockwork Detective (fictional demo)",
    rightsholder: "Brass Lantern Studios (fictional)",
    owner: "demo.owner",
    status: "QUALIFIED",
    ipArchetype: "prestige-drama",
    economics: {
      storeActuals: { orders: 8_000, realizedAovCents: 2_800, currency: "USD" },
      bridge: {
        discountsCents: 1_600_000,
        cancellationsCents: 500_000,
        refundsCents: 1_100_000,
        chargebacksCents: 100_000,
        excludedTaxesDutiesCents: 1_700_000,
      },
      agreement: {
        agreementId: "AGR-DEMO-CLOCKWORK",
        version: 1,
        currency: "USD",
        components: [{ kind: "ROYALTY", rateBps: 1_000, baseLayer: EconomicLayer.STORE_NET_SALES }],
      },
      costs: {
        variableCostsCents: 500_000,
        committedLaunchCostsCents: 250_000,
        guaranteeExposureCents: 100_000,
        writeDownsCents: 50_000,
      },
      pipeline: { pRightsWin: 0.5, delayDiscount: 0.9, capacityFeasibility: 1 },
    },
  },
  {
    id: "demo-moon-mercs",
    title: "Moon Mercs (fictional demo)",
    rightsholder: "Low Orbit Animation (fictional)",
    owner: "demo.owner",
    status: "QUALIFIED",
    ipArchetype: "adult-animation",
    economics: {
      storeActuals: { orders: 5_000, realizedAovCents: 2_000, currency: "USD" },
      bridge: {
        discountsCents: 500_000,
        cancellationsCents: 200_000,
        refundsCents: 300_000,
        chargebacksCents: 0,
        excludedTaxesDutiesCents: 800_000,
      },
      agreement: {
        agreementId: "AGR-DEMO-MERCS",
        version: 1,
        currency: "USD",
        components: [{ kind: "ROYALTY", rateBps: 800, baseLayer: EconomicLayer.CONSUMER_GMS }],
      },
      costs: {
        variableCostsCents: 300_000,
        committedLaunchCostsCents: 100_000,
        guaranteeExposureCents: 150_000,
        writeDownsCents: 0,
      },
      pipeline: { pRightsWin: 0.35, delayDiscount: 0.85, capacityFeasibility: 1 },
    },
  },
  {
    id: "demo-unmapped",
    title: "Kaiju Office Romance (fictional demo)",
    rightsholder: "Tectonic Heart Films (fictional)",
    owner: "demo.owner",
    status: "PROSPECT",
    ipArchetype: "genre-comedy",
    economics: {
      // Agreement not yet on file → TERMS_UNMAPPED: store layers only.
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
  },
];

export function listDemoOpportunities(): readonly DemoOpportunity[] {
  return OPPORTUNITIES;
}

export function getDemoOpportunity(id: string): DemoOpportunity | undefined {
  return OPPORTUNITIES.find((o) => o.id === id);
}
