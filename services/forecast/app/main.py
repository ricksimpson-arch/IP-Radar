"""Forecast service API (stub implementation, real contract).

Phase 0: no real data sources, no models. The endpoint demonstrates and locks
the response contract: weekly P10/P50/P90, disclosed comparables, distance
metric, confidence label, and OOD abstention. Phase 2 replaces the stub with
cohort baselines + calibrated models behind the same contract.
"""

from fastapi import FastAPI
from pydantic import BaseModel, Field

from .contracts import (
    FORECAST_HORIZON_WEEKS,
    ComparableLaunch,
    ConfidenceLabel,
    EconomicLayer,
    ForecastResponse,
    WeeklyQuantiles,
    confidence_from_distance,
)

META = {
    "metric_version": "metric-v0.placeholder",
    "model_version": "model-v0.stub",
    "data_snapshot_id": "snapshot-demo-fixtures",
}

app = FastAPI(title="ip-radar forecast service", version="0.1.0")


class ForecastRequest(BaseModel):
    opportunity_id: str
    layer: EconomicLayer = EconomicLayer.STORE_NET_SALES
    # Stub knob standing in for real feature-space distance until Phase 2.
    distance_from_training_support: float = Field(default=0.3, ge=0.0)
    weekly_p50_cents: int = Field(default=100_000, ge=0)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", **META}


@app.post("/v1/forecast", response_model=ForecastResponse)
def forecast(req: ForecastRequest) -> ForecastResponse:
    confidence = confidence_from_distance(req.distance_from_training_support)

    if confidence is ConfidenceLabel.OUT_OF_DISTRIBUTION:
        # Abstain: no curve is emitted for OOD requests. The UI renders an
        # abstention banner instead of numbers (build-spec §5 Stage 2).
        return ForecastResponse(
            opportunity_id=req.opportunity_id,
            layer=req.layer,
            weekly=[],
            comparables_used=[],
            distance_from_training_support=req.distance_from_training_support,
            confidence=confidence,
            abstained=True,
            abstention_reason=(
                "Request is outside training support; no comparable launches are "
                "close enough to forecast responsibly. Provide comparables or "
                "collect pilot data."
            ),
            **META,
        )

    weekly = [
        WeeklyQuantiles(
            week_index=w,
            p10_cents=int(req.weekly_p50_cents * 0.6),
            p50_cents=req.weekly_p50_cents,
            p90_cents=int(req.weekly_p50_cents * 1.7),
            layer=req.layer,
        )
        for w in range(FORECAST_HORIZON_WEEKS)
    ]
    return ForecastResponse(
        opportunity_id=req.opportunity_id,
        layer=req.layer,
        weekly=weekly,
        comparables_used=[
            ComparableLaunch(
                launch_id="stub-comparable-1",
                similarity=0.8,
                dimensions=["genre", "audience", "release_type"],
            )
        ],
        distance_from_training_support=req.distance_from_training_support,
        confidence=confidence,
        **META,
    )
