"""Generate expected results from SciPy for statinfer's Vitest tests.

Run from the project root:  python scripts/generate_fixtures.py
"""

import json
import math
from pathlib import Path

import numpy as np
import scipy
from scipy import stats

OUT_DIR = Path(__file__).resolve().parent.parent / "test" / "fixtures"


def finite_or_none(value):
    """JSON can't store infinity, so infinite CI bounds are saved as null."""
    value = float(value)
    return value if math.isfinite(value) else None


def summarise(result, estimate):
    ci = result.confidence_interval(confidence_level=0.95)
    return {
        "statistic": float(result.statistic),
        "pValue": float(result.pvalue),
        "df": float(result.df),
        "estimate": float(estimate),
        "confidenceInterval": [finite_or_none(ci.low), finite_or_none(ci.high)],
    }


x = [5.1, 4.9, 5.6, 5.8, 6.0, 5.5, 5.3, 6.2]
y = [4.8, 5.0, 5.2, 4.7, 5.1, 5.4, 4.9, 5.0, 4.6]
before = [72, 75, 71, 78, 74, 69, 77, 73]
after = [70, 74, 68, 75, 73, 68, 74, 72]

cases = []
for alt in ["two-sided", "less", "greater"]:
    cases.append({
        "name": f"one-sample, mu = 5, {alt}",
        "input": {"kind": "one-sample", "x": x, "mu": 5, "alternative": alt},
        "expected": summarise(stats.ttest_1samp(x, 5, alternative=alt), np.mean(x)),
    })
    cases.append({
        "name": f"paired, {alt}",
        "input": {"kind": "paired", "x": after, "y": before, "alternative": alt},
        "expected": summarise(
            stats.ttest_rel(after, before, alternative=alt),
            np.mean(np.subtract(after, before)),
        ),
    })
    cases.append({
        "name": f"Welch two-sample, {alt}",
        "input": {"kind": "welch", "x": x, "y": y, "alternative": alt},
        "expected": summarise(
            stats.ttest_ind(x, y, equal_var=False, alternative=alt),
            np.mean(x) - np.mean(y),
        ),
    })
    cases.append({
        "name": f"pooled two-sample, {alt}",
        "input": {"kind": "pooled", "x": x, "y": y, "alternative": alt},
        "expected": summarise(
            stats.ttest_ind(x, y, equal_var=True, alternative=alt),
            np.mean(x) - np.mean(y),
        ),
    })

output = {
    "generatedWith": {"scipy": scipy.__version__, "numpy": np.__version__},
    "cases": cases,
}

OUT_DIR.mkdir(parents=True, exist_ok=True)
(OUT_DIR / "ttest.json").write_text(json.dumps(output, indent=2, allow_nan=False) + "\n")
print(f"Wrote {len(cases)} cases to {OUT_DIR / 'ttest.json'}")