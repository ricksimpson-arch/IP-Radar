from datetime import date

import pytest

from app.leakage import FeatureRecord, LeakageError, assert_no_leakage, find_leakage

CUTOFF = date(2026, 6, 1)


def test_clean_features_pass():
    features = [
        FeatureRecord("trailing_4wk_orders", date(2026, 5, 25)),
        FeatureRecord("stage_at_cutoff", date(2026, 6, 1)),  # exactly at cutoff is allowed
    ]
    assert find_leakage(features, CUTOFF) == []
    assert_no_leakage(features, CUTOFF)  # does not raise


def test_post_cutoff_feature_is_named_in_the_error():
    features = [
        FeatureRecord("trailing_4wk_orders", date(2026, 5, 25)),
        FeatureRecord("launch_week_sales", date(2026, 7, 4)),  # leaked!
    ]
    with pytest.raises(LeakageError) as excinfo:
        assert_no_leakage(features, CUTOFF)
    assert "launch_week_sales@2026-07-04" in str(excinfo.value)
    assert excinfo.value.offenders == ["launch_week_sales@2026-07-04"]
