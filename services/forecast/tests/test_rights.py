import pytest

from app.rights import (
    StageOutcome,
    brier_score,
    predict_p_win,
    reliability_curve,
    stage_conversion_baseline,
)


def closed(opp_id: str, stages: tuple[str, ...], won: bool) -> StageOutcome:
    return StageOutcome(opportunity_id=opp_id, stages_reached=stages, won=won)


HISTORY = [
    closed("o1", ("PROSPECT", "QUALIFIED", "IN_NEGOTIATION"), True),
    closed("o2", ("PROSPECT", "QUALIFIED", "IN_NEGOTIATION"), True),
    closed("o3", ("PROSPECT", "QUALIFIED", "IN_NEGOTIATION"), False),
    closed("o4", ("PROSPECT", "QUALIFIED"), False),
    closed("o5", ("PROSPECT", "QUALIFIED"), False),
    closed("o6", ("PROSPECT",), False),
]


def test_stage_conversion_rates_are_hand_computable():
    baseline = stage_conversion_baseline(HISTORY, min_observations=3)
    assert baseline["PROSPECT"] == pytest.approx(2 / 6)
    assert baseline["QUALIFIED"] == pytest.approx(2 / 5)
    assert baseline["IN_NEGOTIATION"] == pytest.approx(2 / 3)


def test_thin_stages_are_omitted_not_estimated():
    baseline = stage_conversion_baseline(HISTORY, min_observations=5)
    assert "IN_NEGOTIATION" not in baseline  # only 3 closed observations
    assert predict_p_win(baseline, "IN_NEGOTIATION") is None  # caller must surface "cannot score"


def test_brier_score_hand_computed():
    # ((0.8-1)^2 + (0.3-0)^2 + (0.5-1)^2) / 3 = (0.04 + 0.09 + 0.25) / 3
    score = brier_score([0.8, 0.3, 0.5], [True, False, True])
    assert score == pytest.approx(0.38 / 3)


def test_brier_rejects_out_of_range_predictions():
    with pytest.raises(ValueError):
        brier_score([1.2], [True])


def test_reliability_curve_bins_and_omits_empty():
    predictions = [0.05, 0.08, 0.92, 0.95]
    outcomes = [False, False, True, True]
    curve = reliability_curve(predictions, outcomes, n_bins=10)
    assert len(curve) == 2  # only the 0.0-0.1 and 0.9-1.0 bins have data
    low, high = curve
    assert low.observed_rate == 0.0 and low.count == 2
    assert high.observed_rate == 1.0 and high.count == 2
    assert high.mean_predicted == pytest.approx(0.935)
