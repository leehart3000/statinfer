import normalCdf from "@stdlib/stats-base-dists-normal-cdf";
import normalQuantile from "@stdlib/stats-base-dists-normal-quantile";
import type { Alternative, TestResult } from "./types.js";

/** Options for {@link proportionTest}. Pass single numbers for a one-sample test, or pairs for a two-sample test. */
export interface ProportionTestOptions {
  /** Number of successes: one number, or a pair for two groups. */
  successes: number | readonly [number, number];
  /** Number of trials: one number, or a pair for two groups. */
  trials: number | readonly [number, number];
  /** The hypothesised proportion, for one-sample tests only. Default: 0.5. */
  p?: number;
  /** "greater" means the proportion is above `p` (one sample), or the first group's is higher (two samples). Default: "two-sided". */
  alternative?: Alternative;
  /** Default: 0.95. */
  confidenceLevel?: number;
}

/**
 * z-test for one proportion, or for the difference between two proportions.
 * Two-sample tests check whether the two proportions are equal.
 */
export function proportionTest(options: ProportionTestOptions): TestResult {
  const { successes, trials, p = 0.5, alternative = "two-sided", confidenceLevel = 0.95 } = options;

  if (!(confidenceLevel > 0 && confidenceLevel < 1)) {
    throw new RangeError("confidenceLevel must be between 0 and 1");
  }

  if (typeof successes === "number") {
    if (typeof trials !== "number") {
      throw new TypeError("successes and trials must both be numbers, or both be pairs");
    }
    checkCounts(successes, trials);
    if (!(p > 0 && p < 1)) {
      throw new RangeError("p must be between 0 and 1");
    }
    const estimate = successes / trials;
    const statistic = (estimate - p) / Math.sqrt((p * (1 - p)) / trials);
    const se = Math.sqrt((estimate * (1 - estimate)) / trials);
    return finish("One-sample z-test for a proportion", statistic, estimate, se, [0, 1], alternative, confidenceLevel);
  }

  if (typeof trials === "number") {
    throw new TypeError("successes and trials must both be numbers, or both be pairs");
  }

  const [x1, x2] = successes;
  const [n1, n2] = trials;
  checkCounts(x1, n1);
  checkCounts(x2, n2);

  const p1 = x1 / n1;
  const p2 = x2 / n2;
  const estimate = p1 - p2;
  const pooled = (x1 + x2) / (n1 + n2);
  const statistic = estimate / Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));
  const se = Math.sqrt((p1 * (1 - p1)) / n1 + (p2 * (1 - p2)) / n2);
  return finish("Two-sample z-test for proportions", statistic, estimate, se, [-1, 1], alternative, confidenceLevel);
}

function checkCounts(successes: number, trials: number): void {
  if (!Number.isInteger(successes) || !Number.isInteger(trials) || trials < 1) {
    throw new RangeError("successes and trials must be whole numbers, with trials at least 1");
  }
  if (successes < 0 || successes > trials) {
    throw new RangeError("successes must be between 0 and trials");
  }
}

/** Shared final step: p-value and confidence interval from a z-statistic. */
function finish(
  method: string,
  statistic: number,
  estimate: number,
  se: number,
  [lowerLimit, upperLimit]: readonly [number, number],
  alternative: Alternative,
  confidenceLevel: number,
): TestResult {
  const phi = (z: number) => normalCdf(z, 0, 1);
  let pValue: number;
  let confidenceInterval: [number, number];

  switch (alternative) {
    case "two-sided": {
      pValue = 2 * phi(-Math.abs(statistic));
      const q = normalQuantile(1 - (1 - confidenceLevel) / 2, 0, 1);
      confidenceInterval = [estimate - q * se, estimate + q * se];
      break;
    }
    case "less": {
      pValue = phi(statistic);
      const q = normalQuantile(confidenceLevel, 0, 1);
      confidenceInterval = [lowerLimit, estimate + q * se];
      break;
    }
    case "greater": {
      pValue = phi(-statistic);
      const q = normalQuantile(confidenceLevel, 0, 1);
      confidenceInterval = [estimate - q * se, upperLimit];
      break;
    }
  }

  return { method, statistic, pValue, df: null, estimate, confidenceInterval, confidenceLevel, alternative };
}