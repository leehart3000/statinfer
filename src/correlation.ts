import normalQuantile from "@stdlib/stats-base-dists-normal-quantile";
import tCdf from "@stdlib/stats-base-dists-t-cdf";
import { mean } from "./descriptive.js";
import { rank } from "./rank.js";
import type { Alternative, TestResult } from "./types.js";

export interface CorrelationTestOptions {
  x: readonly number[];
  /** Must be the same length as x. */
  y: readonly number[];
  /** Default: "pearson". */
  method?: "pearson" | "spearman";
  /** "greater" tests for positive correlation, "less" for negative. */
  alternative?: Alternative;
  /** Default: 0.95. Used for Pearson's confidence interval. */
  confidenceLevel?: number;
}

/**
 * Tests whether x and y are correlated, using Pearson's r or Spearman's rho.
 */
export function correlationTest(options: CorrelationTestOptions): TestResult {
  const { x, y, method = "pearson", alternative = "two-sided", confidenceLevel = 0.95 } = options;

  if (!(confidenceLevel > 0 && confidenceLevel < 1)) {
    throw new RangeError("confidenceLevel must be between 0 and 1");
  }
  if (x.length !== y.length) {
    throw new RangeError("x and y must be the same length");
  }
  if (x.length < 3) {
    throw new RangeError("x and y need at least three pairs of values");
  }
  if (!x.every(Number.isFinite) || !y.every(Number.isFinite)) {
    throw new RangeError("x and y must contain only finite numbers");
  }

  const n = x.length;
  const r = method === "spearman" ? pearsonR(rank(x), rank(y)) : pearsonR(x, y);
  const df = n - 2;
  const statistic = r * Math.sqrt(df / (1 - r * r));

  let pValue: number;
  switch (alternative) {
    case "two-sided":
      pValue = 2 * tCdf(-Math.abs(statistic), df);
      break;
    case "less":
      pValue = tCdf(statistic, df);
      break;
    case "greater":
      pValue = tCdf(-statistic, df);
      break;
  }

  let confidenceInterval: [number, number] | null = null;
  if (method === "pearson") {
    // Fisher transformation: atanh(r) is roughly normal with this standard error.
    const z = Math.atanh(r);
    const se = 1 / Math.sqrt(n - 3);
    switch (alternative) {
      case "two-sided": {
        const q = normalQuantile(1 - (1 - confidenceLevel) / 2, 0, 1);
        confidenceInterval = [Math.tanh(z - q * se), Math.tanh(z + q * se)];
        break;
      }
      case "less": {
        const q = normalQuantile(confidenceLevel, 0, 1);
        confidenceInterval = [-1, Math.tanh(z + q * se)];
        break;
      }
      case "greater": {
        const q = normalQuantile(confidenceLevel, 0, 1);
        confidenceInterval = [Math.tanh(z - q * se), 1];
        break;
      }
    }
  }

  return {
    method: method === "spearman" ? "Spearman rank correlation test" : "Pearson correlation test",
    statistic,
    pValue,
    df,
    estimate: r,
    confidenceInterval,
    confidenceLevel: confidenceInterval ? confidenceLevel : null,
    alternative,
  };
}

function pearsonR(x: readonly number[], y: readonly number[]): number {
  const mx = mean(x);
  const my = mean(y);
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < x.length; i++) {
    const dx = x[i]! - mx;
    const dy = y[i]! - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  if (sxx === 0 || syy === 0) {
    throw new RangeError("x and y must not be constant");
  }
  // Rounding can push r fractionally past ±1, so clamp it.
  return Math.max(-1, Math.min(1, sxy / Math.sqrt(sxx * syy)));
}