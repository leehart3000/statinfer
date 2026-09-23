import gammainc from "@stdlib/math-base-special-gammainc";
import type { TestResult } from "./types.js";

export interface ChiSquareIndependenceOptions {
  /** A table of counts, as rows. Needs at least 2 rows and 2 columns. */
  table: readonly (readonly number[])[];
  /** Apply Yates' continuity correction to 2×2 tables. Default: true. */
  correction?: boolean;
}

export interface ChiSquareGoodnessOfFitOptions {
  /** Observed counts in each category. */
  observed: readonly number[];
  /** Expected proportion for each category, adding up to 1. Default: all equal. */
  expectedProportions?: readonly number[];
}

export type ChiSquareTestOptions = ChiSquareIndependenceOptions | ChiSquareGoodnessOfFitOptions;

/**
 * Chi-square test of independence (pass `table`) or goodness-of-fit (pass `observed`).
 */
export function chiSquareTest(options: ChiSquareTestOptions): TestResult {
  return "table" in options ? independence(options) : goodnessOfFit(options);
}

/** P(chi-square > statistic), calculated directly for accuracy. */
function upperTail(statistic: number, df: number): number {
  return gammainc(statistic / 2, df / 2, true, true);
}

function checkCount(value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError("counts must be non-negative numbers");
  }
}

function sum(values: readonly number[]): number {
  let total = 0;
  for (const v of values) total += v;
  return total;
}

function independence({ table, correction = true }: ChiSquareIndependenceOptions): TestResult {
  const rows = table.length;
  const cols = table[0]?.length ?? 0;
  if (rows < 2 || cols < 2) {
    throw new RangeError("table needs at least 2 rows and 2 columns");
  }
  for (const row of table) {
    if (row.length !== cols) {
      throw new RangeError("every row of the table must be the same length");
    }
    row.forEach(checkCount);
  }

  const rowTotals = table.map(sum);
  const colTotals = Array.from({ length: cols }, (_, j) => sum(table.map((row) => row[j]!)));
  const total = sum(rowTotals);
  if (rowTotals.includes(0) || colTotals.includes(0)) {
    throw new RangeError("every row and column needs at least one count");
  }

  const df = (rows - 1) * (cols - 1);
  const applyCorrection = correction && df === 1;
  let statistic = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const expected = (rowTotals[i]! * colTotals[j]!) / total;
      let diff = Math.abs(table[i]![j]! - expected);
      if (applyCorrection) diff -= Math.min(0.5, diff);
      statistic += (diff * diff) / expected;
    }
  }

  return {
    method: applyCorrection
      ? "Chi-square test of independence (Yates' correction)"
      : "Chi-square test of independence",
    statistic,
    pValue: upperTail(statistic, df),
    df,
    estimate: null,
    confidenceInterval: null,
    confidenceLevel: null,
    alternative: null,
  };
}

function goodnessOfFit({ observed, expectedProportions }: ChiSquareGoodnessOfFitOptions): TestResult {
  const k = observed.length;
  if (k < 2) {
    throw new RangeError("observed needs at least two categories");
  }
  observed.forEach(checkCount);
  const total = sum(observed);
  if (total === 0) {
    throw new RangeError("observed needs at least one count");
  }

  const proportions = expectedProportions ?? Array<number>(k).fill(1 / k);
  if (proportions.length !== k) {
    throw new RangeError("expectedProportions must have one value per category");
  }
  if (proportions.some((p) => !(p > 0))) {
    throw new RangeError("expectedProportions must all be greater than 0");
  }
  if (Math.abs(sum(proportions) - 1) > 1e-8) {
    throw new RangeError("expectedProportions must add up to 1");
  }

  let statistic = 0;
  for (let i = 0; i < k; i++) {
    const expected = total * proportions[i]!;
    const diff = observed[i]! - expected;
    statistic += (diff * diff) / expected;
  }

  const df = k - 1;
  return {
    method: "Chi-square goodness-of-fit test",
    statistic,
    pValue: upperTail(statistic, df),
    df,
    estimate: null,
    confidenceInterval: null,
    confidenceLevel: null,
    alternative: null,
  };
}