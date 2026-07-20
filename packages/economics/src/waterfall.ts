import { EconomicLayer, type LayeredMoney } from "./layers.js";
import { type AgreementVersion, TermsUnmappedError } from "./agreements.js";
import { fyulContribution, fyulRecognized, gms, pipelineEv, storeNetSales } from "./identities.js";

/**
 * Full input set for one title's five-layer waterfall. This is the shape the
 * API, web surfaces, and scenario engine all share — the identities in
 * identities.ts remain the only place layer math happens.
 */
export interface TitleEconomicsInputs {
  storeActuals: {
    orders: number;
    realizedAovCents: number;
    currency: string;
  };
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
  pipeline: {
    pRightsWin: number;
    delayDiscount: number;
    capacityFeasibility: number;
  };
}

export type StoreLayers = {
  [EconomicLayer.CONSUMER_GMS]: LayeredMoney;
  [EconomicLayer.STORE_NET_SALES]: LayeredMoney;
};

export type AllLayers = StoreLayers & {
  [EconomicLayer.FYUL_RECOGNIZED]: LayeredMoney;
  [EconomicLayer.FYUL_CONTRIBUTION]: LayeredMoney;
  [EconomicLayer.PIPELINE_EV]: LayeredMoney;
};

/**
 * Discriminated result: unmapped terms produce store layers ONLY, with an
 * explicit status — FYUL layers are structurally absent, not null or zero.
 */
export type WaterfallResult =
  | { status: "OK"; layers: AllLayers }
  | { status: "TERMS_UNMAPPED"; detail: string; layers: StoreLayers };

export function computeWaterfall(inputs: TitleEconomicsInputs): WaterfallResult {
  const gmsValue = gms(inputs.storeActuals);
  const netValue = storeNetSales({ gms: gmsValue, ...inputs.bridge });
  const storeLayers: StoreLayers = {
    [EconomicLayer.CONSUMER_GMS]: gmsValue,
    [EconomicLayer.STORE_NET_SALES]: netValue,
  };

  try {
    const recognized = fyulRecognized({ agreement: inputs.agreement, bases: storeLayers });
    const contribution = fyulContribution({ recognized, ...inputs.costs });
    const ev = pipelineEv({ conditionalContribution: contribution, ...inputs.pipeline });
    return {
      status: "OK",
      layers: {
        ...storeLayers,
        [EconomicLayer.FYUL_RECOGNIZED]: recognized,
        [EconomicLayer.FYUL_CONTRIBUTION]: contribution,
        [EconomicLayer.PIPELINE_EV]: ev,
      },
    };
  } catch (err) {
    if (err instanceof TermsUnmappedError) {
      return { status: "TERMS_UNMAPPED", detail: err.message, layers: storeLayers };
    }
    throw err;
  }
}
