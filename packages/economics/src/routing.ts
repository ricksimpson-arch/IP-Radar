import { EconomicLayer } from "./layers.js";

/**
 * Routing scorer (§5/§6.5) — TypeScript twin of services/forecast/app/routing.py
 * so the web surface can score demo candidates without the Python service.
 * The two implementations are kept rule-identical; when the real optimizer
 * lands in Phase 2 the service becomes the single authority and this module
 * only renders its output.
 *
 * Rules: lowest unit cost is NOT automatically optimal; infeasible routes are
 * excluded with reasons, never dropped; weights are always caller-supplied —
 * no system defaults.
 */
export interface RouteCandidate {
  routeId: string;
  providers: string[];
  /** Conditional contribution if this route is chosen — layer FYUL_CONTRIBUTION. */
  expectedContributionCents: number;
  unitCostCents: number;
  capacityUnitsPerWeek: number;
  requiredUnitsPerWeek: number;
  complianceEligible: boolean;
  complianceReason?: string;
  dataAgeDays: number;
  expectedDelayDays: number;
  qualityScore: number; // 0..1
  stockoutRisk: number; // 0..1
  providerConcentration: number; // 0..1
}

export interface RoutingWeights {
  delayPenaltyCentsPerDay: number;
  qualityMissPenaltyCents: number;
  stockoutPenaltyCents: number;
  concentrationPenaltyCents: number;
  providerDataFreshnessSlaDays: number;
}

export interface ScoredRoute {
  routeId: string;
  providers: string[];
  scoreCents: number;
  scoreLayer: EconomicLayer.FYUL_CONTRIBUTION;
  expectedContributionCents: number;
  unitCostCents: number;
  penalties: {
    deliveryDelay: number;
    qualityMiss: number;
    stockout: number;
    providerConcentration: number;
  };
}

export interface ExcludedRoute {
  routeId: string;
  providers: string[];
  reasons: string[];
}

export interface RoutingRecommendation {
  recommended: ScoredRoute | null;
  ranked: ScoredRoute[];
  excluded: ExcludedRoute[];
}

export function exclusionReasons(candidate: RouteCandidate, weights: RoutingWeights): string[] {
  const reasons: string[] = [];
  if (candidate.capacityUnitsPerWeek < candidate.requiredUnitsPerWeek) {
    reasons.push(
      `insufficient capacity: ${candidate.capacityUnitsPerWeek}/wk available < ` +
        `${candidate.requiredUnitsPerWeek}/wk required`
    );
  }
  if (!candidate.complianceEligible) {
    reasons.push(
      `compliance ineligible: ${candidate.complianceReason ?? "market eligibility not established"}`
    );
  }
  if (candidate.dataAgeDays > weights.providerDataFreshnessSlaDays) {
    reasons.push(
      `stale provider data: ${candidate.dataAgeDays}d old > freshness SLA ` +
        `${weights.providerDataFreshnessSlaDays}d`
    );
  }
  return reasons;
}

export function scoreRoute(candidate: RouteCandidate, weights: RoutingWeights): ScoredRoute {
  const penalties = {
    deliveryDelay: Math.round(candidate.expectedDelayDays * weights.delayPenaltyCentsPerDay),
    qualityMiss: Math.round((1 - candidate.qualityScore) * weights.qualityMissPenaltyCents),
    stockout: Math.round(candidate.stockoutRisk * weights.stockoutPenaltyCents),
    providerConcentration: Math.round(
      candidate.providerConcentration * weights.concentrationPenaltyCents
    ),
  };
  const totalPenalty =
    penalties.deliveryDelay + penalties.qualityMiss + penalties.stockout + penalties.providerConcentration;
  return {
    routeId: candidate.routeId,
    providers: candidate.providers,
    scoreCents: candidate.expectedContributionCents - totalPenalty,
    scoreLayer: EconomicLayer.FYUL_CONTRIBUTION,
    expectedContributionCents: candidate.expectedContributionCents,
    unitCostCents: candidate.unitCostCents,
    penalties,
  };
}

export function recommendRoute(
  candidates: RouteCandidate[],
  weights: RoutingWeights
): RoutingRecommendation {
  const excluded: ExcludedRoute[] = [];
  const feasible: RouteCandidate[] = [];
  for (const candidate of candidates) {
    const reasons = exclusionReasons(candidate, weights);
    if (reasons.length > 0) {
      excluded.push({ routeId: candidate.routeId, providers: candidate.providers, reasons });
    } else {
      feasible.push(candidate);
    }
  }
  const ranked = feasible.map((c) => scoreRoute(c, weights)).sort((a, b) => b.scoreCents - a.scoreCents);
  return { recommended: ranked[0] ?? null, ranked, excluded };
}
