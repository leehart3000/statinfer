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


# --- Chi-square tests ------------------------------------------------------

chi_cases = []

for table, correction in [
    ([[12, 5], [7, 16]], True),
    ([[12, 5], [7, 16]], False),
    ([[20, 15, 25], [30, 25, 10]], True),
]:
    res = stats.chi2_contingency(table, correction=correction)
    chi_cases.append({
        "name": f"independence, {len(table)}x{len(table[0])}, correction={correction}",
        "input": {"table": table, "correction": correction},
        "expected": {
            "statistic": float(res.statistic),
            "pValue": float(res.pvalue),
            "df": int(res.dof),
        },
    })

for observed, proportions in [
    ([18, 22, 30, 30], None),
    ([45, 35, 20], [0.5, 0.3, 0.2]),
]:
    f_exp = None if proportions is None else np.array(proportions) * sum(observed)
    res = stats.chisquare(observed, f_exp=f_exp)
    case_input = {"observed": observed}
    if proportions is not None:
        case_input["expectedProportions"] = proportions
    chi_cases.append({
        "name": f"goodness-of-fit, {observed}, proportions={proportions or 'equal'}",
        "input": case_input,
        "expected": {
            "statistic": float(res.statistic),
            "pValue": float(res.pvalue),
            "df": len(observed) - 1,
        },
    })

chi_output = {"generatedWith": {"scipy": scipy.__version__}, "cases": chi_cases}
(OUT_DIR / "chisquare.json").write_text(json.dumps(chi_output, indent=2, allow_nan=False) + "\n")
print(f"Wrote {len(chi_cases)} cases to {OUT_DIR / 'chisquare.json'}")


# --- Correlation tests -----------------------------------------------------

cx = [2.1, 3.4, 1.9, 5.6, 4.2, 3.3, 6.1, 2.8, 4.9, 3.7]
cy = [1.8, 3.9, 2.2, 5.1, 3.6, 3.5, 6.4, 2.5, 4.1, 4.4]
# Data with ties, to check the ranking helper.
tx = [1, 2, 2, 3, 4, 4, 4, 5, 6, 7]
ty = [2, 1, 3, 3, 5, 4, 6, 6, 8, 7]


def t_from_r(r, df):
    """The t-statistic for a correlation (SciPy reports r itself, not t)."""
    return r * math.sqrt(df / (1 - r * r))


corr_cases = []
for alt in ["two-sided", "less", "greater"]:
    res = stats.pearsonr(cx, cy, alternative=alt)
    ci = res.confidence_interval(confidence_level=0.95)
    r, df = float(res.statistic), len(cx) - 2
    corr_cases.append({
        "name": f"pearson, {alt}",
        "input": {"x": cx, "y": cy, "method": "pearson", "alternative": alt},
        "expected": {
            "estimate": r,
            "statistic": t_from_r(r, df),
            "pValue": float(res.pvalue),
            "df": df,
            "confidenceInterval": [float(ci.low), float(ci.high)],
        },
    })

    res = stats.spearmanr(tx, ty, alternative=alt)
    rho, df = float(res.statistic), len(tx) - 2
    corr_cases.append({
        "name": f"spearman with ties, {alt}",
        "input": {"x": tx, "y": ty, "method": "spearman", "alternative": alt},
        "expected": {
            "estimate": rho,
            "statistic": t_from_r(rho, df),
            "pValue": float(res.pvalue),
            "df": df,
            "confidenceInterval": None,
        },
    })

corr_output = {"generatedWith": {"scipy": scipy.__version__}, "cases": corr_cases}
(OUT_DIR / "correlation.json").write_text(json.dumps(corr_output, indent=2, allow_nan=False) + "\n")
print(f"Wrote {len(corr_cases)} cases to {OUT_DIR / 'correlation.json'}")


# --- One-way ANOVA ---------------------------------------------------------

anova_cases = []
for groups in [
    [[23, 25, 21, 27, 24], [30, 28, 33, 29], [22, 20, 24, 23, 21, 25]],
    [[5.1, 4.8, 5.5, 5.0], [5.3, 5.6, 5.2, 5.9, 5.4], [4.9, 5.0, 4.7, 5.2], [5.8, 6.1, 5.7, 6.0, 5.9]],
]:
    res = stats.f_oneway(*groups)
    k = len(groups)
    n = sum(len(g) for g in groups)
    anova_cases.append({
        "name": f"{k} groups, sizes {[len(g) for g in groups]}",
        "input": {"groups": groups},
        "expected": {
            "statistic": float(res.statistic),
            "pValue": float(res.pvalue),
            "df": [k - 1, n - k],
        },
    })

anova_output = {"generatedWith": {"scipy": scipy.__version__}, "cases": anova_cases}
(OUT_DIR / "anova.json").write_text(json.dumps(anova_output, indent=2, allow_nan=False) + "\n")
print(f"Wrote {len(anova_cases)} cases to {OUT_DIR / 'anova.json'}")


# --- Fisher's exact test ---------------------------------------------------

fisher_cases = []
for table, alts in [
    ([[8, 2], [1, 5]], ["two-sided", "less", "greater"]),
    ([[3, 1], [1, 3]], ["two-sided", "less", "greater"]),
    ([[0, 5], [6, 2]], ["two-sided"]),
]:
    for alt in alts:
        res = stats.fisher_exact(table, alternative=alt)
        fisher_cases.append({
            "name": f"{table}, {alt}",
            "input": {"table": table, "alternative": alt},
            "expected": {
                "statistic": table[0][0],
                "pValue": float(res.pvalue),
                "estimate": float(res.statistic),
            },
        })

fisher_output = {"generatedWith": {"scipy": scipy.__version__}, "cases": fisher_cases}
(OUT_DIR / "fisher.json").write_text(json.dumps(fisher_output, indent=2, allow_nan=False) + "\n")
print(f"Wrote {len(fisher_cases)} cases to {OUT_DIR / 'fisher.json'}")
