"""Backtest metrics (build-spec §8): WAPE, MAE, bias, and empirical P10/P90
interval coverage, computed per horizon bucket and per segment (archetype,
region, path). Pure functions over aligned actual/forecast series — the
harness that feeds them time-aware, leakage-checked splits arrives with the
Phase 2 models, but the metric definitions are locked (and tested) now so
every model comparison uses identical arithmetic.

These operate on unit counts or layer-tagged cent amounts alike; they never
mix values from different economic layers — callers must pass series from a
single layer (asserted via the `layer` tag on ForecastPoint).
"""

from dataclasses import dataclass

from .contracts import EconomicLayer


@dataclass(frozen=True)
class ForecastPoint:
    """One week of forecast vs actual, in integer cents (or units)."""

    horizon_week: int  # weeks ahead at which the forecast was made
    actual_cents: int
    p10_cents: int
    p50_cents: int
    p90_cents: int
    layer: EconomicLayer
    segment: str = "all"  # archetype/region/path key; "all" if unsegmented


@dataclass(frozen=True)
class BacktestMetrics:
    n: int
    wape: float | None  # sum|err| / sum|actual|; None if actuals sum to zero
    mae_cents: float
    bias_cents: float  # mean(forecast − actual); positive = over-forecast
    p10_coverage: float  # share of actuals >= p10 (target 0.90)
    p90_coverage: float  # share of actuals <= p90 (target 0.90)
    interval_coverage: float  # share within [p10, p90] (target 0.80)


class LayerMixError(ValueError):
    pass


def _assert_single_layer(points: list[ForecastPoint]) -> None:
    layers = {p.layer for p in points}
    if len(layers) > 1:
        raise LayerMixError(
            f"backtest series mixes economic layers {sorted(l.value for l in layers)}; "
            "metrics must be computed within a single layer"
        )


def compute_metrics(points: list[ForecastPoint]) -> BacktestMetrics:
    if not points:
        raise ValueError("cannot compute metrics on an empty series")
    _assert_single_layer(points)

    n = len(points)
    abs_err_sum = sum(abs(p.p50_cents - p.actual_cents) for p in points)
    actual_abs_sum = sum(abs(p.actual_cents) for p in points)
    return BacktestMetrics(
        n=n,
        wape=(abs_err_sum / actual_abs_sum) if actual_abs_sum > 0 else None,
        mae_cents=abs_err_sum / n,
        bias_cents=sum(p.p50_cents - p.actual_cents for p in points) / n,
        p10_coverage=sum(1 for p in points if p.actual_cents >= p.p10_cents) / n,
        p90_coverage=sum(1 for p in points if p.actual_cents <= p.p90_cents) / n,
        interval_coverage=sum(1 for p in points if p.p10_cents <= p.actual_cents <= p.p90_cents)
        / n,
    )


HORIZON_BUCKETS = ((1, 4), (5, 13), (14, 26), (27, 52), (53, 156))


def metrics_by_horizon(points: list[ForecastPoint]) -> dict[str, BacktestMetrics]:
    """Metrics per horizon bucket (weeks-ahead). Empty buckets are omitted —
    an absent key means 'no data', which reads differently from a bad score."""
    _assert_single_layer(points)
    out: dict[str, BacktestMetrics] = {}
    for lo, hi in HORIZON_BUCKETS:
        bucket = [p for p in points if lo <= p.horizon_week <= hi]
        if bucket:
            out[f"w{lo}-{hi}"] = compute_metrics(bucket)
    return out


def metrics_by_segment(points: list[ForecastPoint]) -> dict[str, BacktestMetrics]:
    _assert_single_layer(points)
    segments = sorted({p.segment for p in points})
    return {s: compute_metrics([p for p in points if p.segment == s]) for s in segments}
