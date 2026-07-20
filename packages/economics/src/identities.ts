import {
  EconomicLayer,
  type LayeredMoney,
  assertLayer,
  assertNonNegativeCents,
  assertSameCurrency,
  money,
} from "./layers.js";
import {
  type AgreementVersion,
  type RoyaltyBaseLayer,
  TermsUnmappedError,
  isRecognizedComponentKind,
} from "./agreements.js";

/** gms = orders × realized_aov */
export function gms(input: {
  orders: number;
  realizedAovCents: number;
  currency: string;
}): LayeredMoney {
  if (!Number.isSafeInteger(input.orders) || input.orders < 0) {
    throw new RangeError(`orders must be a non-negative integer, got ${input.orders}`);
  }
  assertNonNegativeCents(input.realizedAovCents, "realizedAovCents");
  return money(input.orders * input.realizedAovCents, input.currency, EconomicLayer.CONSUMER_GMS);
}

/** store_net = gms − discounts − cancellations − refunds − chargebacks − excluded_taxes_duties */
export function storeNetSales(input: {
  gms: LayeredMoney;
  discountsCents: number;
  cancellationsCents: number;
  refundsCents: number;
  chargebacksCents: number;
  excludedTaxesDutiesCents: number;
}): LayeredMoney {
  assertLayer(input.gms, EconomicLayer.CONSUMER_GMS);
  assertNonNegativeCents(input.discountsCents, "discountsCents");
  assertNonNegativeCents(input.cancellationsCents, "cancellationsCents");
  assertNonNegativeCents(input.refundsCents, "refundsCents");
  assertNonNegativeCents(input.chargebacksCents, "chargebacksCents");
  assertNonNegativeCents(input.excludedTaxesDutiesCents, "excludedTaxesDutiesCents");
  const amount =
    input.gms.amountCents -
    input.discountsCents -
    input.cancellationsCents -
    input.refundsCents -
    input.chargebacksCents -
    input.excludedTaxesDutiesCents;
  return money(amount, input.gms.currency, EconomicLayer.STORE_NET_SALES);
}

/**
 * fyul_recognized = Σ contract_defined_components(agreement_version)
 *
 * Throws TermsUnmappedError if the agreement is missing, has no components,
 * or any component cannot be computed from its declared terms. NEVER falls
 * back to a default rate — an unmapped agreement blocks the FYUL layers.
 *
 * Rate-based components (ROYALTY, REVENUE_SHARE, SERVICE_FEE_RATE) are
 * applied to a layer-tagged base the caller supplies via `bases`; the
 * component's declared baseLayer must match a provided base. Amounts round
 * half-away-from-zero to the cent at this single boundary.
 */
export function fyulRecognized(input: {
  agreement: AgreementVersion | null | undefined;
  bases: Partial<Record<RoyaltyBaseLayer, LayeredMoney>>;
}): LayeredMoney {
  const agreement = input.agreement;
  if (!agreement) {
    throw new TermsUnmappedError("no agreement version on file");
  }
  if (!agreement.components || agreement.components.length === 0) {
    throw new TermsUnmappedError("agreement has no recognized components", agreement.agreementId);
  }

  let totalCents = 0;
  for (const [i, component] of agreement.components.entries()) {
    const where = `component[${i}] kind="${component.kind}"`;
    if (!isRecognizedComponentKind(component.kind)) {
      throw new TermsUnmappedError(`${where} is not a mapped component kind`, agreement.agreementId);
    }
    switch (component.kind) {
      case "SERVICE_FEE_FIXED":
      case "MINIMUM_GUARANTEE_TRUE_UP": {
        if (component.amountCents === undefined) {
          throw new TermsUnmappedError(`${where} is missing amountCents`, agreement.agreementId);
        }
        assertNonNegativeCents(component.amountCents, `${where}.amountCents`);
        totalCents += component.amountCents;
        break;
      }
      case "ROYALTY":
      case "REVENUE_SHARE":
      case "SERVICE_FEE_RATE": {
        if (component.rateBps === undefined || component.baseLayer === undefined) {
          throw new TermsUnmappedError(`${where} is missing rateBps or baseLayer`, agreement.agreementId);
        }
        if (!Number.isSafeInteger(component.rateBps) || component.rateBps < 0 || component.rateBps > 10_000) {
          throw new TermsUnmappedError(
            `${where} has invalid rateBps ${component.rateBps} (must be integer 0..10000)`,
            agreement.agreementId
          );
        }
        if (
          component.baseLayer !== EconomicLayer.CONSUMER_GMS &&
          component.baseLayer !== EconomicLayer.STORE_NET_SALES
        ) {
          throw new TermsUnmappedError(
            `${where} declares base "${component.baseLayer}"; only CONSUMER_GMS or STORE_NET_SALES are valid bases`,
            agreement.agreementId
          );
        }
        const base = input.bases[component.baseLayer];
        if (!base) {
          throw new TermsUnmappedError(
            `${where} requires a ${component.baseLayer} base amount, none provided`,
            agreement.agreementId
          );
        }
        assertLayer(base, component.baseLayer);
        assertSameCurrency(base, agreement);
        totalCents += roundHalfAwayFromZero((base.amountCents * component.rateBps) / 10_000);
        break;
      }
    }
  }
  return money(totalCents, agreement.currency, EconomicLayer.FYUL_RECOGNIZED);
}

/** fyul_contribution = recognized − variable_costs − committed_launch_costs − guarantee_exposure − write_downs */
export function fyulContribution(input: {
  recognized: LayeredMoney;
  variableCostsCents: number;
  committedLaunchCostsCents: number;
  guaranteeExposureCents: number;
  writeDownsCents: number;
}): LayeredMoney {
  assertLayer(input.recognized, EconomicLayer.FYUL_RECOGNIZED);
  assertNonNegativeCents(input.variableCostsCents, "variableCostsCents");
  assertNonNegativeCents(input.committedLaunchCostsCents, "committedLaunchCostsCents");
  assertNonNegativeCents(input.guaranteeExposureCents, "guaranteeExposureCents");
  assertNonNegativeCents(input.writeDownsCents, "writeDownsCents");
  const amount =
    input.recognized.amountCents -
    input.variableCostsCents -
    input.committedLaunchCostsCents -
    input.guaranteeExposureCents -
    input.writeDownsCents;
  return money(amount, input.recognized.currency, EconomicLayer.FYUL_CONTRIBUTION);
}

/** pipeline_ev = p_rights_win × conditional_contribution × delay_discount × capacity_feasibility */
export function pipelineEv(input: {
  pRightsWin: number;
  conditionalContribution: LayeredMoney;
  delayDiscount: number;
  capacityFeasibility: number;
}): LayeredMoney {
  assertLayer(input.conditionalContribution, EconomicLayer.FYUL_CONTRIBUTION);
  assertUnitInterval(input.pRightsWin, "pRightsWin");
  assertUnitInterval(input.delayDiscount, "delayDiscount");
  assertUnitInterval(input.capacityFeasibility, "capacityFeasibility");
  const amount = roundHalfAwayFromZero(
    input.conditionalContribution.amountCents *
      input.pRightsWin *
      input.delayDiscount *
      input.capacityFeasibility
  );
  return money(amount, input.conditionalContribution.currency, EconomicLayer.PIPELINE_EV);
}

function assertUnitInterval(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`${field} must be within [0, 1], got ${value}`);
  }
}

function roundHalfAwayFromZero(value: number): number {
  return Math.sign(value) * Math.round(Math.abs(value));
}
