"""Cohort baseline demand forecast (build-spec §5 Stage 2, Phase 1).

The simple, auditable baseline that ships first: weekly quantiles taken
across comparable launches' realized curves, with partial pooling toward the
cohort-wide weekly mean. Gradient boosting / hierarchical Bayesian models may
only replace this after LOIO + time-aware backtests show durable lift.

Cold-start rule: fewer than MIN_COMPARABLES comparables → abstain. A curve
built from one or two launches is an anecdote wearing a confidence interval.
"""

from dataclasses import dataclass

MIN_COMPARABLES = 3
# Pooling strength: weeks with few comparables shrink harder toward the
# cohort mean. Placeholder until Phase 2 backtesting tunes it
# (config/assumptions.example.yaml).
DEFAULT_POOLING_K = 2.0


@dataclass(frozen=True)
class CohortWeek:
    week_index: int
    p10_cents: int
    p50_cents: int
    p90_cents: int


class InsufficientComparablesError(ValueError):
    def __init__(self, n: int):
        super().__init__(
            f"cohort baseline needs >= {MIN_COMPARABLES} comparables, got {n}; abstaining"
        )
        self.n = n


def _percentile(sorted_values: list[float], q: float) -> float:
    """Linear-interpolation percentile (numpy 'linear' method):
    index = (n − 1) × q, interpolate between neighbors."""
    n = len(sorted_values)
    if n == 1:
        return sorted_values[0]
    position = (n - 1) * q
    lower = int(position)
    upper = min(lower + 1, n - 1)
    fraction = position - lower
    return sorted_values[lower] + (sorted_values[upper] - sorted_values[lower]) * fraction


def cohort_baseline(
    comparable_curves: list[list[int]],
    horizon_weeks: int,
    pooling_k: float = DEFAULT_POOLING_K,
) -> list[CohortWeek]:
    """Weekly P10/P50/P90 from comparable curves.

    Each comparable contributes its value for week w when its history is that
    long; weeks beyond a comparable's history simply have fewer observations
    (and shrink harder toward the pooled mean rather than pretending the
    short-lived comparable said zero).
    """
    if len(comparable_curves) < MIN_COMPARABLES:
        raise InsufficientComparablesError(len(comparable_curves))
    if any(len(curve) == 0 for curve in comparable_curves):
        raise ValueError("comparable curves must be non-empty")

    all_values = [v for curve in comparable_curves for v in curve]
    pooled_mean = sum(all_values) / len(all_values)

    weeks: list[CohortWeek] = []
    for w in range(horizon_weeks):
        observations = sorted(float(curve[w]) for curve in comparable_curves if w < len(curve))
        if not observations:
            # No comparable ran this long: fall back fully to the pooled mean,
            # with a wide interval to say so.
            weeks.append(
                CohortWeek(
                    week_index=w,
                    p10_cents=round(pooled_mean * 0.5),
                    p50_cents=round(pooled_mean),
                    p90_cents=round(pooled_mean * 1.5),
                )
            )
            continue
        n = len(observations)
        shrink = n / (n + pooling_k)  # partial pooling weight on the empirical quantile

        def pooled(q: float) -> int:
            empirical = _percentile(observations, q)
            return round(shrink * empirical + (1 - shrink) * pooled_mean)

        p10, p50, p90 = pooled(0.10), pooled(0.50), pooled(0.90)
        # Quantile crossing cannot happen with a common shrink target, but
        # guard anyway: intervals must be ordered.
        weeks.append(
            CohortWeek(
                week_index=w,
                p10_cents=min(p10, p50),
                p50_cents=p50,
                p90_cents=max(p90, p50),
            )
        )
    return weeks
