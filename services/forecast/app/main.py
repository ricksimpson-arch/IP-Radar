"""Forecast service API.

Phase 0/1 scope: no real data sources. The forecast endpoint runs the
comparable-cohort baseline when the caller supplies comparable curves, and a
deterministic stub otherwise; either way the CONTRACT is binding — weekly
P10/P50/P90, disclosed comparables, distance metric, confidence label, OOD
abstention, and a forecast_run_id that can regenerate the identical response.
"""

from uuid import uuid4

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from .cohort import MIN_COMPARABLES, cohort_baseline
from .contracts import (
    FORECAST_HORIZON_WEEKS,
    ComparableCurve,
    ComparableLaunch,
    ConfidenceLabel,
    EconomicLayer,
    ForecastResponse,
    WeeklyQuantiles,
    confidence_from_distance,
)
from .routing import RouteCandidate, RoutingRecommendation, RoutingWeights, recommend_route

META = {
    "metric_version": "metric-v0.placeholder",
    "data_snapshot_id": "snapshot-demo-fixtures",
}

app = FastAPI(title="ip-radar forecast service", version="0.1.0")


class ForecastRequest(BaseModel):
    opportunity_id: str
    layer: EconomicLayer = EconomicLayer.STORE_NET_SALES
    # Feature-space distance stub until Phase 2 supplies the real metric.
    distance_from_training_support: float = Field(default=0.3, ge=0.0)
    weekly_p50_cents: int = Field(default=100_000, ge=0)
    # Comparable realized curves; when >= MIN_COMPARABLES the cohort baseline
    # runs instead of the stub. Fewer than the minimum (but > 0) → abstain.
    comparables: list[ComparableCurve] = Field(default_factory=list)


def compute_forecast(req: ForecastRequest) -> ForecastResponse:
    """Pure forecast computation — no registry side effects, no randomness.
    The reproducibility guarantee rests on this function's purity."""
    confidence = confidence_from_distance(req.distance_from_training_support)

    def respond(**kwargs) -> ForecastResponse:
        return ForecastResponse(
            opportunity_id=req.opportunity_id,
            layer=req.layer,
            distance_from_training_support=req.distance_from_training_support,
            forecast_run_id="",  # assigned by the registry at request time
            metric_version=META["metric_version"],
            data_snapshot_id=META["data_snapshot_id"],
            **kwargs,
        )

    if confidence is ConfidenceLabel.OUT_OF_DISTRIBUTION:
        return respond(
            model_version="model-v0.abstain",
            weekly=[],
            comparables_used=[],
            confidence=confidence,
            abstained=True,
            abstention_reason=(
                "Request is outside training support; no comparable launches are "
                "close enough to forecast responsibly. Provide comparables or "
                "collect pilot data."
            ),
        )

    if 0 < len(req.comparables) < MIN_COMPARABLES:
        return respond(
            model_version="model-v0.abstain",
            weekly=[],
            comparables_used=[
                ComparableLaunch(launch_id=c.launch_id, similarity=1.0, dimensions=["provided_directly"])
                for c in req.comparables
            ],
            confidence=ConfidenceLabel.LOW,
            abstained=True,
            abstention_reason=(
                f"Only {len(req.comparables)} comparable(s) supplied; the cohort baseline "
                f"requires >= {MIN_COMPARABLES}. A curve built from fewer is an anecdote "
                "wearing a confidence interval."
            ),
        )

    if req.comparables:
        curve = cohort_baseline(
            [c.weekly_p50_cents for c in req.comparables], FORECAST_HORIZON_WEEKS
        )
        return respond(
            model_version="model-v0.cohort-median-baseline",
            weekly=[
                WeeklyQuantiles(
                    week_index=w.week_index,
                    p10_cents=w.p10_cents,
                    p50_cents=w.p50_cents,
                    p90_cents=w.p90_cents,
                    layer=req.layer,
                )
                for w in curve
            ],
            comparables_used=[
                ComparableLaunch(launch_id=c.launch_id, similarity=1.0, dimensions=["provided_directly"])
                for c in req.comparables
            ],
            confidence=confidence,
        )

    # Stub path: deterministic placeholder curve, clearly versioned as such.
    return respond(
        model_version="model-v0.stub",
        weekly=[
            WeeklyQuantiles(
                week_index=w,
                p10_cents=int(req.weekly_p50_cents * 0.6),
                p50_cents=req.weekly_p50_cents,
                p90_cents=int(req.weekly_p50_cents * 1.7),
                layer=req.layer,
            )
            for w in range(FORECAST_HORIZON_WEEKS)
        ],
        comparables_used=[
            ComparableLaunch(
                launch_id="stub-comparable-1",
                similarity=0.8,
                dimensions=["genre", "audience", "release_type"],
            )
        ],
        confidence=confidence,
    )


class RunRegistry:
    """In-memory stand-in for the immutable forecast_runs table: records the
    exact request so any run can be regenerated and compared. Swapped for
    Postgres persistence in Phase 3."""

    def __init__(self) -> None:
        self._runs: dict[str, tuple[ForecastRequest, ForecastResponse]] = {}

    def register(self, req: ForecastRequest, response: ForecastResponse) -> str:
        run_id = f"run-{uuid4()}"
        self._runs[run_id] = (req, response)
        return run_id

    def get(self, run_id: str) -> tuple[ForecastRequest, ForecastResponse] | None:
        return self._runs.get(run_id)


registry = RunRegistry()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "model_version": "model-v0", **META}


@app.post("/v1/forecast", response_model=ForecastResponse)
def forecast(req: ForecastRequest) -> ForecastResponse:
    response = compute_forecast(req)
    return response.model_copy(update={"forecast_run_id": registry.register(req, response)})


class ReproduceResult(BaseModel):
    forecast_run_id: str
    reproducible: bool


@app.get("/v1/runs/{run_id}/reproduce", response_model=ReproduceResult)
def reproduce(run_id: str) -> ReproduceResult:
    """Reproducibility check (§8): regenerate the forecast from the recorded
    request and verify it is identical (run id aside)."""
    recorded = registry.get(run_id)
    if recorded is None:
        raise HTTPException(status_code=404, detail="unknown forecast_run_id")
    request, stored_response = recorded
    regenerated = compute_forecast(request)
    return ReproduceResult(forecast_run_id=run_id, reproducible=regenerated == stored_response)


class RoutingRequest(BaseModel):
    opportunity_id: str
    candidates: list[RouteCandidate]
    # No default weights exist — callers must supply Phase-0-approved values.
    weights: RoutingWeights


@app.post("/v1/routing", response_model=RoutingRecommendation)
def routing(req: RoutingRequest) -> RoutingRecommendation:
    return recommend_route(req.candidates, req.weights)
