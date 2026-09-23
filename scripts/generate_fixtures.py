"""Generate expected results from SciPy for statinfer's Vitest tests.

Run from the project root:  python scripts/generate_fixtures.py
"""

import json
import math
from pathlib import Path

import numpy as np
import scipy
from scipy import stats

from statsmodels.stats.proportion import (
    confint_proportions_2indep,
    proportion_confint,
    proportions_ztest,
)

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


# --- Proportion z-tests ----------------------------------------------------

def one_sided(low, high, alt, floor, ceiling):
    """Keep one end of the interval; the other goes to the natural limit."""
    if alt == "less":
        return [floor, float(high)]
    if alt == "greater":
        return [float(low), ceiling]
    return [float(low), float(high)]


prop_cases = []
for alt, sm_alt in [("two-sided", "two-sided"), ("less", "smaller"), ("greater", "larger")]:
    # A one-sided 95% bound equals one end of a two-sided 90% interval.
    alpha = 0.05 if alt == "two-sided" else 0.10

    z, p = proportions_ztest(58, 100, value=0.5, alternative=sm_alt, prop_var=0.5)
    low, high = proportion_confint(58, 100, alpha=alpha, method="normal")
    prop_cases.append({
        "name": f"one-sample, 58/100 vs p = 0.5, {alt}",
        "input": {"successes": 58, "trials": 100, "p": 0.5, "alternative": alt},
        "expected": {
            "statistic": float(z),
            "pValue": float(p),
            "estimate": 58 / 100,
            "confidenceInterval": one_sided(low, high, alt, 0.0, 1.0),
        },
    })

    z, p = proportions_ztest([45, 30], [120, 110], value=0, alternative=sm_alt)
    low, high = confint_proportions_2indep(45, 120, 30, 110, method="wald", compare="diff", alpha=alpha)
    prop_cases.append({
        "name": f"two-sample, 45/120 vs 30/110, {alt}",
        "input": {"successes": [45, 30], "trials": [120, 110], "alternative": alt},
        "expected": {
            "statistic": float(z),
            "pValue": float(p),
            "estimate": 45 / 120 - 30 / 110,
            "confidenceInterval": one_sided(low, high, alt, -1.0, 1.0),
        },
    })

prop_output = {
    "generatedWith": {"statsmodels": __import__("statsmodels").__version__},
    "cases": prop_cases,
}
(OUT_DIR / "proportion.json").write_text(json.dumps(prop_output, indent=2, allow_nan=False) + "\n")
print(f"Wrote {len(prop_cases)} cases to {OUT_DIR / 'proportion.json'}")
