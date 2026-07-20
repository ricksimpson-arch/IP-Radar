from fastapi.testclient import TestClient

from app.contracts import FORECAST_HORIZON_WEEKS, ConfidenceLabel, confidence_from_distance
from app.main import app

client = TestClient(app)


def test_health_carries_version_envelope():
    body = client.get("/health").json()
    assert body["status"] == "ok"
    assert body["metric_version"]
    assert body["model_version"]
    assert body["data_snapshot_id"]


def test_forecast_contract_shape():
    res = client.post("/v1/forecast", json={"opportunity_id": "opp-1"})
    assert res.status_code == 200
    body = res.json()
    assert body["horizon_weeks"] == FORECAST_HORIZON_WEEKS
    assert len(body["weekly"]) == FORECAST_HORIZON_WEEKS
    week = body["weekly"][0]
    assert week["p10_cents"] <= week["p50_cents"] <= week["p90_cents"]
    assert week["layer"] == "STORE_NET_SALES"
    assert body["comparables_used"], "comparables must always be disclosed"
    assert body["confidence"] in {"high", "medium", "low"}
    assert body["abstained"] is False
    assert body["metric_version"] and body["model_version"] and body["data_snapshot_id"]


def test_out_of_distribution_abstains_with_no_curve():
    res = client.post(
        "/v1/forecast",
        json={"opportunity_id": "opp-ood", "distance_from_training_support": 5.0},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["confidence"] == "out_of_distribution"
    assert body["abstained"] is True
    assert body["weekly"] == []
    assert body["abstention_reason"]


def test_confidence_thresholds():
    assert confidence_from_distance(0.0) is ConfidenceLabel.HIGH
    assert confidence_from_distance(0.7) is ConfidenceLabel.MEDIUM
    assert confidence_from_distance(1.5) is ConfidenceLabel.LOW
    assert confidence_from_distance(2.0) is ConfidenceLabel.OUT_OF_DISTRIBUTION
