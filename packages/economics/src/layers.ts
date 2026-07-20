/**
 * The five economic layers. Every money value in the platform is tagged with
 * exactly one layer — there is no generic `revenue` field anywhere in the
 * codebase (enforced by lint + scripts/check-layer-tagging.mjs in CI).
 */
export enum EconomicLayer {
  /** Checkout merch value pre-refund/adjustment. */
  CONSUMER_GMS = "CONSUMER_GMS",
  /** GMS − discounts − cancels − refunds − chargebacks − taxes/duties. */
  STORE_NET_SALES = "STORE_NET_SALES",
  /** Contract-defined recognized components only; NO default take rate. */
  FYUL_RECOGNIZED = "FYUL_RECOGNIZED",
  /** Recognized − variable costs − committed launch costs − guarantee exposure − write-downs. */
  FYUL_CONTRIBUTION = "FYUL_CONTRIBUTION",
  /** P(rights win) × conditional contribution × launch-delay discount × capacity factor. */
  PIPELINE_EV = "PIPELINE_EV",
}

/**
 * A money value tagged with its economic layer. Amounts are integer minor
 * units (cents) — golden tests must match to the cent, so floats are never
 * stored, only produced transiently and rounded at a single boundary.
 */
export interface LayeredMoney {
  readonly amountCents: number;
  readonly currency: string;
  readonly layer: EconomicLayer;
}

export class LayerMismatchError extends Error {
  readonly code = "LAYER_MISMATCH";
  constructor(expected: EconomicLayer, actual: EconomicLayer) {
    super(`Expected money tagged ${expected}, got ${actual}. Layers must never be blended.`);
    this.name = "LayerMismatchError";
  }
}

export class CurrencyMismatchError extends Error {
  readonly code = "CURRENCY_MISMATCH";
  constructor(a: string, b: string) {
    super(`Currency mismatch: ${a} vs ${b}. Convert via the pinned FX table before combining.`);
    this.name = "CurrencyMismatchError";
  }
}

export function money(amountCents: number, currency: string, layer: EconomicLayer): LayeredMoney {
  assertIntegerCents(amountCents, "amountCents");
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new RangeError(`currency must be an ISO 4217 code, got "${currency}"`);
  }
  return Object.freeze({ amountCents, currency, layer });
}

export function assertLayer(value: LayeredMoney, expected: EconomicLayer): void {
  if (value.layer !== expected) throw new LayerMismatchError(expected, value.layer);
}

export function assertSameCurrency(a: { currency: string }, b: { currency: string }): void {
  if (a.currency !== b.currency) throw new CurrencyMismatchError(a.currency, b.currency);
}

export function assertIntegerCents(value: number, field: string): void {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`${field} must be an integer number of cents, got ${value}`);
  }
}

export function assertNonNegativeCents(value: number, field: string): void {
  assertIntegerCents(value, field);
  if (value < 0) throw new RangeError(`${field} must be >= 0, got ${value}`);
}
