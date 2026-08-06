/**
 * Lead scoring — SPEC.md §9.6. Pure function, 0–100, computed at submission.
 * Weights are illustrative and live in one constants block for post-launch
 * tuning. Bands are advisory and never shown to the applicant.
 */

export const FREE_EMAIL_DOMAINS: readonly string[] = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "gmx.net",
  "mail.com",
  "yandex.com",
  "zoho.com",
];

export const BUDGET_BANDS = [
  "under_25k",
  "25k_75k",
  "75k_150k",
  "150k_plus",
  "undetermined",
] as const;
export type BudgetBand = (typeof BUDGET_BANDS)[number];

export const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"] as const;
export type CompanySize = (typeof COMPANY_SIZES)[number];

export const APPLY_TIMELINES = ["asap", "this_quarter", "this_year", "exploring"] as const;
export type ApplyTimeline = (typeof APPLY_TIMELINES)[number];

/** Segments with strong fit per SPEC.md §3.1. */
const FIT_INDUSTRIES: readonly string[] = [
  "entertainment_media",
  "ecommerce_merch",
  "consumer_products",
  "licensing_ip",
  "private_equity",
  "corporate_strategy",
];

export type LeadSignals = {
  budgetBand: BudgetBand;
  businessProblem: string;
  decisions: string[];
  dataSources: string[];
  timeline: ApplyTimeline;
  companySize: CompanySize;
  industry: string;
  email: string;
  company: string;
  completedPlanner: boolean;
};

const WEIGHTS = {
  budget: 30,
  decisionClarity: 20,
  dataReadiness: 15,
  timeline: 10,
  segmentFit: 10,
  businessEmail: 10,
  planner: 5,
} as const;

const BUDGET_POINTS: Record<BudgetBand, number> = {
  "150k_plus": 30,
  "75k_150k": 24,
  "25k_75k": 16,
  undetermined: 8,
  under_25k: 5,
};

export function emailDomain(email: string): string {
  const at = email.lastIndexOf("@");
  return at === -1 ? "" : email.slice(at + 1).trim().toLowerCase();
}

export function isFreeEmailDomain(email: string): boolean {
  return FREE_EMAIL_DOMAINS.includes(emailDomain(email));
}

/** Loose check that the email domain looks like the stated company. */
export function domainMatchesCompany(email: string, company: string): boolean {
  const domain = emailDomain(email);
  if (!domain) return false;
  const root = domain.split(".")[0] ?? "";
  const normalizedCompany = company.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalizedRoot = root.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (normalizedCompany.length < 3 || normalizedRoot.length < 3) return false;
  return (
    normalizedCompany.includes(normalizedRoot) || normalizedRoot.includes(normalizedCompany)
  );
}

function budgetScore(band: BudgetBand): number {
  return BUDGET_POINTS[band];
}

function decisionClarityScore(signals: LeadSignals): number {
  let points = 0;
  if (signals.decisions.filter((d) => d.trim().length > 0).length >= 1) points += 10;
  const len = signals.businessProblem.trim().length;
  if (len >= 300) points += 10;
  else if (len >= 150) points += 7;
  else if (len >= 100) points += 4;
  return Math.min(points, WEIGHTS.decisionClarity);
}

function dataReadinessScore(signals: LeadSignals): number {
  const sources = signals.dataSources.filter(
    (s) => s !== "none_yet" && s !== "spreadsheets_only",
  );
  if (sources.length === 0) {
    // Spreadsheets are a real (weak) starting point; nothing at all is weaker.
    return signals.dataSources.includes("spreadsheets_only") ? 4 : 0;
  }
  return Math.min(5 + sources.length * 3, WEIGHTS.dataReadiness);
}

function timelineScore(timeline: ApplyTimeline): number {
  const points: Record<ApplyTimeline, number> = {
    asap: 10,
    this_quarter: 8,
    this_year: 5,
    exploring: 2,
  };
  return points[timeline];
}

function segmentFitScore(signals: LeadSignals): number {
  let points = FIT_INDUSTRIES.includes(signals.industry) ? 6 : 2;
  if (signals.companySize === "51-200" || signals.companySize === "201-1000") points += 4;
  else if (signals.companySize === "11-50" || signals.companySize === "1000+") points += 3;
  return Math.min(points, WEIGHTS.segmentFit);
}

function businessEmailScore(signals: LeadSignals): number {
  if (isFreeEmailDomain(signals.email) || !emailDomain(signals.email)) return 0;
  return domainMatchesCompany(signals.email, signals.company) ? 10 : 6;
}

export function leadScore(signals: LeadSignals): number {
  const total =
    budgetScore(signals.budgetBand) +
    decisionClarityScore(signals) +
    dataReadinessScore(signals) +
    timelineScore(signals.timeline) +
    segmentFitScore(signals) +
    businessEmailScore(signals) +
    (signals.completedPlanner ? WEIGHTS.planner : 0);
  return Math.max(0, Math.min(100, total));
}

export type ScoreBand = "priority" | "qualified" | "nurture" | "low";

export function scoreBand(score: number): ScoreBand {
  if (score >= 75) return "priority";
  if (score >= 60) return "qualified";
  if (score >= 40) return "nurture";
  return "low";
}
