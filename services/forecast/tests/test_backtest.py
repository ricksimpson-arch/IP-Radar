import pytest

from app.backtest import (
    ForecastPoint,
    LayerMixError,
    compute_metrics,
    metrics_by_horizon,
    metrics_by_segment,
)
from app.contracts import EconomicLayer

L = EconomicLayer.STORE_NET_SALES


def pt(actual, p50, p10=None, p90=None, horizon=1, segment="all", layer=L):
    return ForecastPoint(
        horizon_week=horizon,
        actual_cents=actual,
        p10_cents=p10 if p10 is not None else p50 // 2,
        p50_cents=p50,
        p90_cents=p90 if p90 is not None else p50 * 2,
        layer=layer,
        segment=segment,
    )


def test_hand_computed_metrics():
    points = [
        pt(actual=100, p50=110),  # err +10
        pt(actual=200, p50=180),  # err -20
        pt(actual=300, p50=330),  # err +30
    ]
    m = compute_metrics(points)
    assert m.n == 3
    assert m.mae_cents == pytest.approx(20.0)  # (10+20+30)/3
    assert m.wape == pytest.approx(60 / 600)
    assert m.bias_cents == pytest.approx((10 - 20 + 30) / 3)


def test_interval_coverage():
    points = [
        pt(actual=100, p50=100, p10=90, p90=110),  # inside
        pt(actual=80, p50=100, p10=90, p90=110),  # below p10
        pt(actual=120, p50=100, p10=90, p90=110),  # above p90
        pt(actual=105, p50=100, p10=90, p90=110),  # inside
    ]
    m = compute_metrics(points)
    assert m.interval_coverage == pytest.approx(0.5)
    assert m.p10_coverage == pytest.approx(0.75)  # one actual fell below p10
    assert m.p90_coverage == pytest.approx(0.75)  # one actual exceeded p90


def test_wape_is_none_when_actuals_are_zero():
    m = compute_metrics([pt(actual=0, p50=50)])
    assert m.wape is None  # explicit None, not a divide-by-zero or fake 0


def test_layer_mixing_is_rejected():
    with pytest.raises(LayerMixError):
        compute_metrics(
            [pt(actual=100, p50=100), pt(actual=100, p50=100, layer=EconomicLayer.CONSUMER_GMS)]
        )


def test_metrics_by_horizon_omits_empty_buckets():
    points = [pt(actual=100, p50=90, horizon=2), pt(actual=100, p50=120, horizon=20)]
    by_h = metrics_by_horizon(points)
    assert set(by_h.keys()) == {"w1-4", "w14-26"}
    assert by_h["w1-4"].n == 1


def test_metrics_by_segment():
    points = [
        pt(actual=100, p50=90, segment="franchise-film"),
        pt(actual=100, p50=150, segment="reality-competition"),
    ]
    by_s = metrics_by_segment(points)
    assert by_s["franchise-film"].mae_cents == pytest.approx(10.0)
    assert by_s["reality-competition"].mae_cents == pytest.approx(50.0)


def test_empty_series_raises():
    with pytest.raises(ValueError):
        compute_metrics([])
