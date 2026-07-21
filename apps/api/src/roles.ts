import type { AgreementVersion } from "@ip-radar/economics";

/**
 * RBAC roles (build-spec §3). Contract terms, guarantee amounts, and provider
 * unit costs are visible only to finance, data_eng, and admin. Until SSO
 * lands (Phase 3), the demo API reads the role from the x-demo-role header —
 * and treats anything missing or unknown as the LEAST privileged view.
 * Default-deny: redaction is the fallback, never the exception.
 */
export const ROLES = [
  "leadership",
  "snow_bd",
  "merch_creative",
  "provider_ops",
  "finance",
  "data_eng",
  "admin",
] as const;

export type Role = (typeof ROLES)[number];

const CONFIDENTIAL_TERM_ROLES: ReadonlySet<Role> = new Set(["finance", "data_eng", "admin"]);

export function parseRole(header: string | undefined): Role | null {
  return (ROLES as readonly string[]).includes(header ?? "") ? (header as Role) : null;
}

export function canSeeConfidentialTerms(role: Role | null): boolean {
  return role !== null && CONFIDENTIAL_TERM_ROLES.has(role);
}

/** Redacted agreement view: existence and mapping status only — no rates,
 * amounts, or component structure. */
export interface RedactedAgreement {
  agreementId: string;
  version: number;
  currency: string;
  termsMapped: boolean;
  redacted: true;
}

export function redactAgreement(agreement: AgreementVersion): RedactedAgreement {
  return {
    agreementId: agreement.agreementId,
    version: agreement.version,
    currency: agreement.currency,
    termsMapped: (agreement.components?.length ?? 0) > 0,
    redacted: true,
  };
}

export function agreementViewFor(
  agreement: AgreementVersion,
  role: Role | null
): AgreementVersion | RedactedAgreement {
  return canSeeConfidentialTerms(role) ? agreement : redactAgreement(agreement);
}
