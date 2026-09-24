import betainc from "@stdlib/math-base-special-betainc";
import { mean } from "./descriptive.js";
import type { TestResult } from "./types.js";

export interface AnovaOptions {
  /** Two or more groups of values. Groups can be different sizes. */
  groups: readonly (readonly number[])[];
}

/**
 * One-way ANOVA: tests whether all groups have the same mean.
 */
export function anova({ groups }: AnovaOptions): TestResult {
  const k = groups.length;
  if (k < 2) {
    throw new RangeError("anova needs at least two groups");
  }
  for (const group of groups) {
    if (group.length === 0) {
      throw new RangeError("every group needs at least one value");
    }
    if (!group.every(Number.isFinite)) {
      throw new RangeError("groups must contain only finite numbers");
    }
  }

  const all = groups.flat();
  const n = all.length;
  if (n <= k) {
    throw new RangeError("at least one group needs two or more values");
  }

  const grandMean = mean(all);
  let betweenGroups = 0;
  let withinGroups = 0;
  for (const group of groups) {
    const groupMean = mean(group);
    betweenGroups += group.length * (groupMean - grandMean) ** 2;
    for (const v of group) withinGroups += (v - groupMean) ** 2;
  }
  if (withinGroups === 0) {
    throw new RangeError("values within each group are all identical, so the F-statistic is undefined");
  }

  const df1 = k - 1;
  const df2 = n - k;
  const statistic = betweenGroups / df1 / (withinGroups / df2);
  // P(F > statistic), via the regularised upper incomplete beta function.
  const pValue = betainc((df1 * statistic) / (df1 * statistic + df2), df1 / 2, df2 / 2, true, true);

  return {
    method: "One-way ANOVA",
    statistic,
    pValue,
    df: [df1, df2],
    estimate: null,
    confidenceInterval: null,
    confidenceLevel: null,
    alternative: null,
  };
}