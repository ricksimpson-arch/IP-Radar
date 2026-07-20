from fastapi.testclient import TestClient

from app.main import app
from app.routing import RouteCandidate, RoutingWeights, recommend_route

client = TestClient(app)

WEIGHTS = RoutingWeights(
    delay_penalty_cents_per_day=50_000,
    quality_miss_penalty_cents=2_000_000,
    stockout_penalty_cents=1_500_000,
    concentration_penalty_cents=800_000,
    provider_data_freshness_sla_days=14,
)


def make_candidate(**overrides) -> RouteCandidate:
    base = dict(
        route_id="route",
        providers=["snow"],
        expected_contribution_cents=5_000_000,
        unit_cost_cents=900,
        capacity_units_per_week=10_000,
        required_units_per_week=5_000,
        compliance_eligible=True,
        data_age_days=3,
        expected_delay_days=2,
        quality_score=0.95,
        stockout_risk=0.05,
        provider_concentration=0.5,
    )
    base.update(overrides)
    return RouteCandidate(**base)


def test_lowest_unit_cost_is_not_automatically_optimal():
    cheap_but_risky = make_candidate(
        route_id="printify-led",
        providers=["printify"],
        unit_cost_cents=600,
        expected_contribution_cents=5_200_000,
        expected_delay_days=12,
        quality_score=0.7,
        stockout_risk=0.4,
        provider_concentration=0.9,
    )
    pricier_reliable = make_candidate(
        route_id="snow-full-service",
        providers=["snow"],
        unit_cost_cents=1_100,
        expected_contribution_cents=4_800_000,
        expected_delay_days=1,
        quality_score=0.97,
        stockout_risk=0.03,
        provider_concentration=0.4,
    )
    rec = recommend_route([cheap_but_risky, pricier_reliable], WEIGHTS)
    assert rec.recommended is not None
    assert rec.recommended.route_id == "snow-full-service"
    assert cheap_but_risky.unit_cost_cents < pricier_reliable.unit_cost_cents


def test_infeasible_routes_are_excluded_with_reasons_not_dropped():
    no_capacity = make_candidate(
        route_id="no-capacity", capacity_units_per_week=100, required_units_per_week=5_000
    )
    not_compliant = make_candidate(
        route_id="not-compliant",
        compliance_eligible=False,
        compliance_reason="missing EU market certificate",
    )
    stale = make_candidate(route_id="stale-data", data_age_days=45)
    ok = make_candidate(route_id="ok-route")

    rec = recommend_route([no_capacity, not_compliant, stale, ok], WEIGHTS)
    assert [r.route_id for r in rec.ranked] == ["ok-route"]
    excluded = {e.route_id: e.reasons for e in rec.excluded}
    assert "insufficient capacity" in excluded["no-capacity"][0]
    assert "missing EU market certificate" in excluded["not-compliant"][0]
    assert "stale provider data" in excluded["stale-data"][0]


def test_empty_feasible_set_returns_no_recommendation():
    rec = recommend_route([make_candidate(route_id="stale", data_age_days=99)], WEIGHTS)
    assert rec.recommended is None
    assert rec.ranked == []
    assert len(rec.excluded) == 1


def test_routing_endpoint_requires_explicit_weights():
    payload = {
        "opportunity_id": "opp-1",
        "candidates": [make_candidate(route_id="r1").model_dump()],
    }
    res = client.post("/v1/routing", json=payload)
    assert res.status_code == 422  # weights are mandatory — no system defaults


def test_routing_endpoint_scores_and_ranks():
    payload = {
        "opportunity_id": "opp-1",
        "candidates": [
            make_candidate(route_id="r1").model_dump(),
            make_candidate(route_id="r2", expected_delay_days=20).model_dump(),
        ],
        "weights": WEIGHTS.model_dump(),
    }
    res = client.post("/v1/routing", json=payload)
    assert res.status_code == 200
    body = res.json()
    assert body["recommended"]["route_id"] == "r1"
    assert body["ranked"][0]["score_cents"] >= body["ranked"][1]["score_cents"]
    assert body["ranked"][0]["score_layer"] == "FYUL_CONTRIBUTION"
    assert body["ranked"][0]["penalties"]["delivery_delay"] >= 0
