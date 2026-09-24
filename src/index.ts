export { mean, variance, standardDeviation } from "./descriptive.js";
export { tTest } from "./ttest.js";
export type { TTestOptions } from "./ttest.js";
export { proportionTest } from "./proportion.js";
export type { ProportionTestOptions } from "./proportion.js";
export { chiSquareTest } from "./chisquare.js";
export type {
  ChiSquareTestOptions,
  ChiSquareIndependenceOptions,
  ChiSquareGoodnessOfFitOptions,
} from "./chisquare.js";
export { correlationTest } from "./correlation.js";
export type { CorrelationTestOptions } from "./correlation.js";
export { anova } from "./anova.js";
export type { AnovaOptions } from "./anova.js";
export type { Alternative, TestResult } from "./types.js";