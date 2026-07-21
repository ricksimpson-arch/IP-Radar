"""Stage 1 baselines (build-spec §5): P(rights win) from historical stage
conversion, plus the calibration metrics used to judge any model that tries
to replace it (Brier score, reliability curve).

This is the baseline every classifier must beat in time-aware backtests —
if it doesn't, we ship this. It only uses terminal outcomes of opportunities
that REACHED a stage, so it is well-defined per stage and needs no features.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class StageOutcome:
    """One historical opportunity's furthest stage reached and terminal outcome."""

    opportunity_id: str
    stages_reached: tuple[str, ...]  # every stage the opportunity entered
    won: bool  # terminal outcome; only closed opportunities belong here


class InsufficientHistoryError(ValueError):
    pass


def stage_conversion_baseline(
    history: list[StageOutcome], min_observations: int = 5
) -> dict[str, float]:
    """P(win | reached stage) per stage, from closed opportunities only.

    Stages with fewer than `min_observations` closed opportunities are
    omitted — an absent stage means 'not enough history to say', never a
    made-up number. Callers must treat a missing stage as un-scorable.
    """
    reached: dict[str, int] = {}
    won: dict[str, int] = {}
    for record in history:
        for stage in set(record.stages_reached):
            reached[stage] = reached.get(stage, 0) + 1
            if record.won:
                won[stage] = won.get(stage, 0) + 1
    return {
        stage: won.get(stage, 0) / n
        for stage, n in reached.items()
        if n >= min_observations
    }


def predict_p_win(baseline: dict[str, float], current_stage: str) -> float | None:
    """None when the stage has no adequately-observed baseline — the caller
    must surface 'cannot score' rather than defaulting."""
    return baseline.get(current_stage)


def brier_score(predictions: list[float], outcomes: list[bool]) -> float:
    """Mean squared error of probabilistic predictions. Lower is better;
    0.25 is the score of always predicting 0.5."""
    if len(predictions) != len(outcomes) or not predictions:
        raise ValueError("predictions and outcomes must be equal-length and non-empty")
    for p in predictions:
        if not 0.0 <= p <= 1.0:
            raise ValueError(f"prediction {p} outside [0, 1]")
    return sum((p - (1.0 if o else 0.0)) ** 2 for p, o in zip(predictions, outcomes)) / len(
        predictions
    )


@dataclass(frozen=True)
class ReliabilityBin:
    mean_predicted: float
    observed_rate: float
    count: int


def reliability_curve(
    predictions: list[float], outcomes: list[bool], n_bins: int = 10
) -> list[ReliabilityBin]:
    """Calibration curve: within each prediction bin, how often did wins
    actually happen. Empty bins are omitted (no data ≠ perfectly calibrated)."""
    if len(predictions) != len(outcomes):
        raise ValueError("predictions and outcomes must be equal length")
    bins: list[list[tuple[float, bool]]] = [[] for _ in range(n_bins)]
    for p, o in zip(predictions, outcomes):
        index = min(int(p * n_bins), n_bins - 1)
        bins[index].append((p, o))
    curve = []
    for members in bins:
        if not members:
            continue
        curve.append(
            ReliabilityBin(
                mean_predicted=sum(p for p, _ in members) / len(members),
                observed_rate=sum(1 for _, o in members if o) / len(members),
                count=len(members),
            )
        )
    return curve
