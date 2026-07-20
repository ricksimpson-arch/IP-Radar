"""Response contracts for the forecast service (build-spec §5).

These pydantic models define the API shape the platform depends on. The
current implementation returns deterministic stub curves (no real data is
connected in Phase 0) — but the CONTRACT is real: weekly P10/P50/P90 over a
156-week horizon, layer-tagged money, explicit confidence labels, and an
abstention banner for out-of-distribution requests.
"""

from enum import Enum

from pydantic import BaseModel, Field

FORECAST_HORIZON_WEEKS = 156


class EconomicLayer(str, Enum):
    CONSUMER_GMS = "CONSUMER_GMS"
    STORE_NET_SALES = "STORE_NET_SALES"
    FYUL_RECOGNIZED = "FYUL_RECOGNIZED"
    FYUL_CONTRIBUTION = "FYUL_CONTRIBUTION"
    PIPELINE_EV = "PIPELINE_EV"


class ConfidenceLabel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    OUT_OF_DISTRIBUTION = "out_of_distribution"


class WeeklyQuantiles(BaseModel):
    week_index: int = Field(ge=0, lt=FORECAST_HORIZON_WEEKS)
    p10_cents: int
    p50_cents: int
    p90_cents: int
    layer: EconomicLayer


class ComparableLaunch(BaseModel):
    """A comparable used by the cold-start borrower — always disclosed."""

    launch_id: str
    similarity: float = Field(ge=0.0, le=1.0)
    dimensions: list[str]  # e.g. genre, audience, rightsholder, release type


class ForecastResponse(BaseModel):
    opportunity_id: str
    layer: EconomicLayer
    horizon_weeks: int = FORECAST_HORIZON_WEEKS
    weekly: list[WeeklyQuantiles]
    comparables_used: list[ComparableLaunch]
    distance_from_training_support: float = Field(ge=0.0)
    confidence: ConfidenceLabel
    abstained: bool = False
    abstention_reason: str | None = None
    # Reproducibility envelope — every response carries pinned versions.
    metric_version: str
    model_version: str
    data_snapshot_id: str


def confidence_from_distance(distance: float) -> ConfidenceLabel:
    """Map distance-from-training-support to a confidence label.

    Thresholds are placeholders pinned in config/assumptions.example.yaml —
    Phase 2 backtesting sets the real ones (OPEN_QUESTIONS #6).
    """
    if distance < 0.5:
        return ConfidenceLabel.HIGH
    if distance < 1.0:
        return ConfidenceLabel.MEDIUM
    if distance < 2.0:
        return ConfidenceLabel.LOW
    return ConfidenceLabel.OUT_OF_DISTRIBUTION
