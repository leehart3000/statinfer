/** Which direction the alternative hypothesis points. */
export type Alternative = "two-sided" | "less" | "greater";

/** The standard result returned by every hypothesis test in statinfer. */
export interface TestResult {
  /** A human-readable name, e.g. "Welch two-sample t-test". */
  readonly method: string;
  /** The test statistic, e.g. t, z, chi-square or F. */
  readonly statistic: number;
  /** The probability of a result at least this extreme if the null hypothesis were true. */
  readonly pValue: number;
  /** Degrees of freedom: one number, two numbers for F-tests, or null if not applicable. */
  readonly df: number | readonly [number, number] | null;
  /** The estimated effect, e.g. a mean difference or odds ratio, or null if not applicable. */
  readonly estimate: number | null;
  /** Lower and upper bounds for `estimate`, or null if the test doesn't provide one. One-sided tests have one open-ended bound. */
  readonly confidenceInterval: readonly [number, number] | null;
  /** The confidence level used for `confidenceInterval`, e.g. 0.95, or null if there's no interval. */
  readonly confidenceLevel: number | null;
  /** Null for tests that have no direction, such as ANOVA or chi-square. */
  readonly alternative: Alternative | null;
}