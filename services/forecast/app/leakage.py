"""Leakage guard (build-spec §4 data-quality gates / §8 leakage test).

Every feature used to train or score carries an as-of timestamp; nothing may
postdate the forecast cutoff. This module is the single enforcement point —
the dbt-side as-of join tests mirror the same rule once the warehouse exists.
"""

from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class FeatureRecord:
    name: str
    as_of: date


class LeakageError(ValueError):
    def __init__(self, offenders: list[str], cutoff: date):
        super().__init__(
            f"{len(offenders)} feature(s) postdate the forecast cutoff {cutoff.isoformat()}: "
            + ", ".join(offenders)
        )
        self.offenders = offenders


def find_leakage(features: list[FeatureRecord], cutoff: date) -> list[str]:
    """Names of features whose as-of timestamp exceeds the cutoff."""
    return [f"{f.name}@{f.as_of.isoformat()}" for f in features if f.as_of > cutoff]


def assert_no_leakage(features: list[FeatureRecord], cutoff: date) -> None:
    offenders = find_leakage(features, cutoff)
    if offenders:
        raise LeakageError(offenders, cutoff)
