import type { TestResult } from "./types.js";

/** Options for {@link summarize}. */
export interface SummarizeOptions {
  /** Number of significant digits to show. Default: 4. */
  digits?: number;
}

/**
 * Formats a test result as a readable, plain-text table.
 * Fields that don't apply to the test (null values) are left out.
 *
 * @example
 * ```ts
 * const result = tTest({ x: [5.1, 4.9, 5.6, 5.8, 6.0], mu: 5 });
 * console.log(summarize(result));
 * ```
 */
export function summarize(result: TestResult, options: SummarizeOptions = {}): string {
  const { digits = 4 } = options;
  if (!Number.isInteger(digits) || digits < 1 || digits > 15) {
    throw new RangeError("digits must be a whole number from 1 to 15");
  }
  const fmt = (x: number) => formatNumber(x, digits);

  const rows: [string, string][] = [
    ["statistic", fmt(result.statistic)],
    ["p-value", fmt(result.pValue)],
  ];
  if (result.df !== null) {
    rows.push(["df", typeof result.df === "number" ? fmt(result.df) : result.df.map(fmt).join(", ")]);
  }
  if (result.estimate !== null) {
    rows.push(["estimate", fmt(result.estimate)]);
  }
  if (result.confidenceInterval !== null) {
    const [low, high] = result.confidenceInterval;
    const label = result.confidenceLevel !== null ? `${fmt(result.confidenceLevel * 100)}% CI` : "CI";
    rows.push([label, `[${fmt(low)}, ${fmt(high)}]`]);
  }
  if (result.alternative !== null) {
    rows.push(["alternative", result.alternative]);
  }

  const width = Math.max(...rows.map(([label]) => label.length)) + 2;
  return [
    result.method,
    "=".repeat(result.method.length),
    ...rows.map(([label, value]) => label.padEnd(width) + value),
  ].join("\n");
}

/** Rounds to significant digits, switching to exponent form for very small or large numbers. */
function formatNumber(x: number, digits: number): string {
  if (Number.isNaN(x)) return "NaN";
  if (x === Infinity) return "Inf";
  if (x === -Infinity) return "-Inf";
  if (x !== 0 && (Math.abs(x) < 1e-4 || Math.abs(x) >= 1e6)) {
    return x.toExponential(digits - 1);
  }
  return String(Number(x.toPrecision(digits)));
}