import hypergeometricPmf from "@stdlib/stats-base-dists-hypergeometric-pmf";
import type { Alternative, TestResult } from "./types.js";

/** Options for {@link fishersExactTest}. */
export interface FishersExactTestOptions {
  /** A 2×2 table of counts: [[a, b], [c, d]]. */
  table: readonly [readonly [number, number], readonly [number, number]];
  /** "greater" tests for an odds ratio above 1, "less" for below 1. */
  alternative?: Alternative;
}

/**
 * Fisher's exact test for a 2×2 table. Reliable even with small counts.
 */
export function fishersExactTest({ table, alternative = "two-sided" }: FishersExactTestOptions): TestResult {
  if (table.length !== 2 || table.some((row) => row.length !== 2)) {
    throw new RangeError("table must be 2×2");
  }
  const [[a, b], [c, d]] = table;
  for (const value of [a, b, c, d]) {
    if (!Number.isInteger(value) || value < 0) {
      throw new RangeError("counts must be non-negative whole numbers");
    }
  }

  // With the row and column totals fixed, the top-left count follows a
  // hypergeometric distribution. Every possible table is one value of it.
  const total = a + b + c + d;
  if (total === 0) {
    throw new RangeError("table needs at least one count");
  }
  const firstRow = a + b;
  const firstColumn = a + c;
  const lowest = Math.max(0, firstColumn - (total - firstRow));
  const highest = Math.min(firstRow, firstColumn);
  const pmf = (x: number) => hypergeometricPmf(x, total, firstRow, firstColumn);

  let pValue = 0;
  switch (alternative) {
    case "less":
      for (let x = lowest; x <= a; x++) pValue += pmf(x);
      break;
    case "greater":
      for (let x = a; x <= highest; x++) pValue += pmf(x);
      break;
    case "two-sided": {
      // Add up every table at least as unlikely as the observed one.
      // The tiny tolerance stops rounding errors excluding equally likely tables.
      const threshold = pmf(a) * (1 + 1e-7);
      for (let x = lowest; x <= highest; x++) {
        const px = pmf(x);
        if (px <= threshold) pValue += px;
      }
      break;
    }
  }

  const ad = a * d;
  const bc = b * c;
  const oddsRatio = bc === 0 ? (ad === 0 ? null : Infinity) : ad / bc;

  return {
    method: "Fisher's exact test",
    statistic: a,
    pValue: Math.min(1, pValue),
    df: null,
    estimate: oddsRatio,
    confidenceInterval: null,
    confidenceLevel: null,
    alternative,
  };
}