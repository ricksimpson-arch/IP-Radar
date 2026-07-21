import pytest

from app.cohort import InsufficientComparablesError, cohort_baseline


def test_quantiles_are_hand_computable_with_full_shrinkage_disabled():
    # Three flat comparables at 100/200/300; pooling_k=0 disables shrinkage so
    # the pure empirical quantiles are exposed: linear interpolation gives
    # p10 = 120, p50 = 200, p90 = 280.
    curves = [[100] * 4, [200] * 4, [300] * 4]
    weeks = cohort_baseline(curves, horizon_weeks=4, pooling_k=0.0)
    assert all(w.p10_cents == 120 for w in weeks)
    assert all(w.p50_cents == 200 for w in weeks)
    assert all(w.p90_cents == 280 for w in weeks)


def test_partial_pooling_shrinks_toward_cohort_mean():
    curves = [[100] * 4, [200] * 4, [300] * 4]  # pooled mean = 200
    weeks = cohort_baseline(curves, horizon_weeks=4, pooling_k=2.0)
    # shrink = 3/5; p10 = 0.6×120 + 0.4×200 = 152; p90 = 0.6×280 + 0.4×200 = 248
    assert weeks[0].p10_cents == 152
    assert weeks[0].p50_cents == 200
    assert weeks[0].p90_cents == 248


def test_short_comparables_reduce_observations_not_pretend_zero():
    curves = [[100, 100], [200, 200], [300, 300, 300]]
    weeks = cohort_baseline(curves, horizon_weeks=3, pooling_k=0.0)
    # Week 2 has only the third comparable's 300 — a single observation.
    assert weeks[2].p50_cents == 300


def test_weeks_beyond_all_histories_fall_back_to_pooled_mean_with_wide_interval():
    curves = [[100], [200], [300]]
    weeks = cohort_baseline(curves, horizon_weeks=2, pooling_k=0.0)
    assert weeks[1].p50_cents == 200
    assert weeks[1].p10_cents == 100
    assert weeks[1].p90_cents == 300


def test_intervals_are_always_ordered():
    curves = [[i * 137 % 500 + 1 for i in range(10)] for _ in range(5)]
    for week in cohort_baseline(curves, horizon_weeks=10):
        assert week.p10_cents <= week.p50_cents <= week.p90_cents


def test_fewer_than_three_comparables_abstains():
    with pytest.raises(InsufficientComparablesError):
        cohort_baseline([[100], [200]], horizon_weeks=1)
