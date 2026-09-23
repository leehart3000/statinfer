import tCdf from "@stdlib/stats-base-dists-t-cdf";
import tQuantile from "@stdlib/stats-base-dists-t-quantile";
import { mean, variance } from "./descriptive.js";
import type { Alternative, TestResult } from "./types.js";

export interface TTestOptions {
  /** The first (or only) sample. */
  x: readonly number[];
  /** The second sample, for paired or two-sample tests. */
  y?: readonly number[];
  /** Treat x and y as matched pairs. Default: false. */
  paired?: boolean;
  /** Use the pooled-variance test instead of Welch's. Default: false. */
  equalVariance?: boolean;
  /** The hypothesised mean (or mean difference). Default: 0. */
  mu?: number;
  alternative?: Alternative;
  /** Default: 0.95. */
  confidenceLevel?: number;
}

/**
 * Student's t-test: one-sample, paired, or two-sample (Welch or pooled).
 */
export function tTest(options: TTestOptions): TestResult {
  const {
    x,
    y,
    paired = false,
    equalVariance = false,
    mu = 0,
    alternative = "two-sided",
    confidenceLevel = 0.95,
  } = options;

  if (!(confidenceLevel > 0 && confidenceLevel < 1)) {
    throw new RangeError("confidenceLevel must be between 0 and 1");
  }
  if (x.length < 2) {
    throw new RangeError("x needs at least two values");
  }

  if (y === undefined) {
    if (paired) {
      throw new TypeError("paired: true needs both x and y");
    }
    const se = Math.sqrt(variance(x) / x.length);
    return finish("One-sample t-test", mean(x), se, x.length - 1, mu, alternative, confidenceLevel);
  }

  if (y.length < 2) {
    throw new RangeError("y needs at least two values");
  }

  if (paired) {
    if (x.length !== y.length) {
      throw new RangeError("A paired t-test needs x and y to be the same length");
    }
    const d = x.map((xi, i) => xi - y[i]!);
    const se = Math.sqrt(variance(d) / d.length);
    return finish("Paired t-test", mean(d), se, d.length - 1, mu, alternative, confidenceLevel);
  }

  const nx = x.length;
  const ny = y.length;
  const vx = variance(x);
  const vy = variance(y);
  const estimate = mean(x) - mean(y);

  if (equalVariance) {
    const df = nx + ny - 2;
    const pooledVariance = ((nx - 1) * vx + (ny - 1) * vy) / df;
    const se = Math.sqrt(pooledVariance * (1 / nx + 1 / ny));
    return finish("Two-sample t-test (pooled variance)", estimate, se, df, mu, alternative, confidenceLevel);
  }

  const ax = vx / nx;
  const ay = vy / ny;
  const se = Math.sqrt(ax + ay);
  const df = (ax + ay) ** 2 / (ax ** 2 / (nx - 1) + ay ** 2 / (ny - 1));
  return finish("Welch two-sample t-test", estimate, se, df, mu, alternative, confidenceLevel);
}

/** Shared final step: statistic, p-value and confidence interval. */
function finish(
  method: string,
  estimate: number,
  se: number,
  df: number,
  mu: number,
  alternative: Alternative,
  confidenceLevel: number,
): TestResult {
  const statistic = (estimate - mu) / se;
  let pValue: number;
  let confidenceInterval: [number, number];

  switch (alternative) {
    case "two-sided": {
      pValue = 2 * tCdf(-Math.abs(statistic), df);
      const q = tQuantile(1 - (1 - confidenceLevel) / 2, df);
      confidenceInterval = [estimate - q * se, estimate + q * se];
      break;
    }
    case "less": {
      pValue = tCdf(statistic, df);
      const q = tQuantile(confidenceLevel, df);
      confidenceInterval = [-Infinity, estimate + q * se];
      break;
    }
    case "greater": {
      pValue = tCdf(-statistic, df);
      const q = tQuantile(confidenceLevel, df);
      confidenceInterval = [estimate - q * se, Infinity];
      break;
    }
  }

  return { method, statistic, pValue, df, estimate, confidenceInterval, confidenceLevel, alternative };
}