"""Routing optimizer prototype (build-spec §5).

Scores feasible Snow / Printful / Printify / hybrid routes by expected
contribution AND service risk. Two hard rules from the spec:

1. Lowest unit cost is NOT automatically optimal — the objective quantifies
   delivery-delay, quality-miss, stockout, compliance, and
   provider-concentration penalties.
2. Infeasible routes (capacity, compliance eligibility, stale data) are
   excluded WITH reasons, never silently dropped.

Penalty weights are never defaulted by the system: callers must supply them
explicitly (Phase 0 sign-off decides real values — see OPEN_QUESTIONS and
config/assumptions.example.yaml `routing.penalty_weights`).
"""

from pydantic import BaseModel, Field

from .contracts import EconomicLayer


class RouteCandidate(BaseModel):
    route_id: str
    providers: list[str]  # e.g. ["snow"] or ["printful", "printify"] for hybrid
    # Conditional contribution if this route is chosen — layer-tagged.
    expected_contribution_cents: int
    contribution_layer: EconomicLayer = EconomicLayer.FYUL_CONTRIBUTION
    unit_cost_cents: int = Field(ge=0)
    capacity_units_per_week: int = Field(ge=0)
    required_units_per_week: int = Field(ge=0)
    compliance_eligible: bool
    compliance_reason: str | None = None
    data_age_days: int = Field(ge=0)
    expected_delay_days: float = Field(ge=0)
    quality_score: float = Field(ge=0.0, le=1.0)
    stockout_risk: float = Field(ge=0.0, le=1.0)
    provider_concentration: float = Field(ge=0.0, le=1.0)


class RoutingWeights(BaseModel):
    """Explicit, caller-supplied penalty weights. No system defaults exist."""

    delay_penalty_cents_per_day: int = Field(ge=0)
    quality_miss_penalty_cents: int = Field(ge=0)
    stockout_penalty_cents: int = Field(ge=0)
    concentration_penalty_cents: int = Field(ge=0)
    provider_data_freshness_sla_days: int = Field(gt=0)


class ScoredRoute(BaseModel):
    route_id: str
    providers: list[str]
    score_cents: int
    score_layer: EconomicLayer = EconomicLayer.FYUL_CONTRIBUTION
    expected_contribution_cents: int
    unit_cost_cents: int
    penalties: dict[str, int]


class ExcludedRoute(BaseModel):
    route_id: str
    providers: list[str]
    reasons: list[str]


class RoutingRecommendation(BaseModel):
    recommended: ScoredRoute | None
    ranked: list[ScoredRoute]
    excluded: list[ExcludedRoute]
    weights: RoutingWeights
    note: str = (
        "Score = expected contribution minus service-risk penalties. "
        "Lowest unit cost is not automatically optimal."
    )


def exclusion_reasons(candidate: RouteCandidate, weights: RoutingWeights) -> list[str]:
    reasons: list[str] = []
    if candidate.capacity_units_per_week < candidate.required_units_per_week:
        reasons.append(
            "insufficient capacity: "
            f"{candidate.capacity_units_per_week}/wk available < "
            f"{candidate.required_units_per_week}/wk required"
        )
    if not candidate.compliance_eligible:
        detail = candidate.compliance_reason or "market eligibility not established"
        reasons.append(f"compliance ineligible: {detail}")
    if candidate.data_age_days > weights.provider_data_freshness_sla_days:
        reasons.append(
            "stale provider data: "
            f"{candidate.data_age_days}d old > freshness SLA "
            f"{weights.provider_data_freshness_sla_days}d"
        )
    return reasons


def score_route(candidate: RouteCandidate, weights: RoutingWeights) -> ScoredRoute:
    penalties = {
        "delivery_delay": round(candidate.expected_delay_days * weights.delay_penalty_cents_per_day),
        "quality_miss": round((1.0 - candidate.quality_score) * weights.quality_miss_penalty_cents),
        "stockout": round(candidate.stockout_risk * weights.stockout_penalty_cents),
        "provider_concentration": round(
            candidate.provider_concentration * weights.concentration_penalty_cents
        ),
    }
    score = candidate.expected_contribution_cents - sum(penalties.values())
    return ScoredRoute(
        route_id=candidate.route_id,
        providers=candidate.providers,
        score_cents=score,
        expected_contribution_cents=candidate.expected_contribution_cents,
        unit_cost_cents=candidate.unit_cost_cents,
        penalties=penalties,
    )


def recommend_route(
    candidates: list[RouteCandidate], weights: RoutingWeights
) -> RoutingRecommendation:
    excluded: list[ExcludedRoute] = []
    feasible: list[RouteCandidate] = []
    for candidate in candidates:
        reasons = exclusion_reasons(candidate, weights)
        if reasons:
            excluded.append(
                ExcludedRoute(
                    route_id=candidate.route_id, providers=candidate.providers, reasons=reasons
                )
            )
        else:
            feasible.append(candidate)

    ranked = sorted(
        (score_route(c, weights) for c in feasible),
        key=lambda r: r.score_cents,
        reverse=True,
    )
    return RoutingRecommendation(
        recommended=ranked[0] if ranked else None,
        ranked=ranked,
        excluded=excluded,
        weights=weights,
    )
