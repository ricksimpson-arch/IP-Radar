from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_forecast_run_can_be_reproduced_identically():
    res = client.post(
        "/v1/forecast",
        json={
            "opportunity_id": "opp-repro",
            "comparables": [
                {"launch_id": "c1", "weekly_p50_cents": [100] * 8},
                {"launch_id": "c2", "weekly_p50_cents": [200] * 8},
                {"launch_id": "c3", "weekly_p50_cents": [300] * 8},
            ],
        },
    )
    assert res.status_code == 200
    run_id = res.json()["forecast_run_id"]
    assert run_id.startswith("run-")

    repro = client.get(f"/v1/runs/{run_id}/reproduce")
    assert repro.status_code == 200
    assert repro.json() == {"forecast_run_id": run_id, "reproducible": True}


def test_unknown_run_id_is_404():
    assert client.get("/v1/runs/run-nope/reproduce").status_code == 404


def test_cohort_baseline_is_used_when_comparables_supplied():
    res = client.post(
        "/v1/forecast",
        json={
            "opportunity_id": "opp-cohort",
            "comparables": [
                {"launch_id": "c1", "weekly_p50_cents": [100] * 4},
                {"launch_id": "c2", "weekly_p50_cents": [200] * 4},
                {"launch_id": "c3", "weekly_p50_cents": [300] * 4},
            ],
        },
    )
    body = res.json()
    assert body["model_version"] == "model-v0.cohort-median-baseline"
    assert body["weekly"][0]["p50_cents"] == 200
    assert [c["launch_id"] for c in body["comparables_used"]] == ["c1", "c2", "c3"]


def test_too_few_comparables_abstains_instead_of_forecasting():
    res = client.post(
        "/v1/forecast",
        json={
            "opportunity_id": "opp-thin",
            "comparables": [{"launch_id": "only-one", "weekly_p50_cents": [100] * 4}],
        },
    )
    body = res.json()
    assert body["abstained"] is True
    assert body["weekly"] == []
    assert "requires >= 3" in body["abstention_reason"]
