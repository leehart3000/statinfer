/** Which direction the alternative hypothesis points. */
export type Alternative = "two-sided" | "less" | "greater";

/** The standard result returned by every hypothesis test in statinfer. */
export interface TestResult {
  /** A human-readable name, e.g. "Welch two-sample t-test". */
  readonly method: string;
  /** The test statistic, e.g. t, z, chi-square or F. */
  readonly statistic: number;
  readonly pValue: number;
  /** Degrees of freedom: one number, two numbers for F-tests, or null if not applicable. */
  readonly df: number | readonly [number, number] | null;
  /** The estimated effect, e.g. a mean difference or odds ratio, or null if not applicable. */
  readonly estimate: number | null;
  readonly confidenceInterval: readonly [number, number] | null;
  readonly confidenceLevel: number | null;
  /** Null for tests that have no direction, such as ANOVA or chi-square. */
  readonly alternative: Alternative | null;
}