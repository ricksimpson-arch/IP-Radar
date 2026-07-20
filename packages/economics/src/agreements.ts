import { EconomicLayer } from "./layers.js";

/**
 * Recognized-component kinds we know how to compute. Anything outside this
 * list is by definition unmapped — fyulRecognized throws TERMS_UNMAPPED, it
 * never estimates and never applies a default take rate.
 */
export const RECOGNIZED_COMPONENT_KINDS = [
  "ROYALTY",
  "REVENUE_SHARE",
  "SERVICE_FEE_FIXED",
  "SERVICE_FEE_RATE",
  "MINIMUM_GUARANTEE_TRUE_UP",
] as const;

export type RecognizedComponentKind = (typeof RECOGNIZED_COMPONENT_KINDS)[number];

/** Royalty/share bases must themselves be layer-tagged; only these two layers are valid bases. */
export type RoyaltyBaseLayer = EconomicLayer.CONSUMER_GMS | EconomicLayer.STORE_NET_SALES;

/**
 * A single contract-defined recognized component, as stored on an
 * agreement_version. `kind` is a plain string at the boundary because
 * agreement terms arrive from external systems unvalidated — fyulRecognized
 * is the validation point.
 */
export interface ContractComponent {
  readonly kind: string;
  /** Fixed components: amount in integer cents. */
  readonly amountCents?: number;
  /** Rate components: basis points applied to `baseLayer`. */
  readonly rateBps?: number;
  readonly baseLayer?: string;
}

export interface AgreementVersion {
  readonly agreementId: string;
  readonly version: number;
  readonly currency: string;
  readonly components: readonly ContractComponent[] | undefined;
}

export class TermsUnmappedError extends Error {
  readonly code = "TERMS_UNMAPPED";
  readonly agreementId: string | undefined;
  constructor(reason: string, agreementId?: string) {
    super(
      `TERMS_UNMAPPED: ${reason}. FYUL_RECOGNIZED and FYUL_CONTRIBUTION are blocked for this ` +
        `opportunity; only store-layer scenarios may be shown. No default take rate exists.`
    );
    this.name = "TermsUnmappedError";
    this.agreementId = agreementId;
  }
}

export function isRecognizedComponentKind(kind: string): kind is RecognizedComponentKind {
  return (RECOGNIZED_COMPONENT_KINDS as readonly string[]).includes(kind);
}
