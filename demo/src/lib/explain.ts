import type { TestResult } from "statinfer";
import { fmt } from "./format";
import { messages } from "./messages";

/**
 * Plain-language sentences for a result that has an estimate and a p-value,
 * plus a confidence interval if the test provides one. `quantity` names what's
 * being estimated (e.g. "true mean"), and `hypothesised` is the value it's
 * being tested against.
 */
export function explainResult(result: TestResult, quantity: string, hypothesised: number): string[] {
  const claim = messages.claim[result.alternative ?? "two-sided"](quantity, hypothesised);
  const p = result.pValue < 0.001 ? messages.pVerySmall : fmt(result.pValue);
  const sentences = [
    messages.estimate(fmt(result.estimate!)),
    messages.pValue(quantity, hypothesised, p),
    result.pValue < 0.05 ? messages.significant(claim) : messages.notSignificant(claim, hypothesised),
  ];

  if (result.confidenceInterval !== null && result.confidenceLevel !== null) {
    const [low, high] = result.confidenceInterval;
    const level = `${fmt(result.confidenceLevel * 100)}%`;
    sentences.push(
      low === -Infinity
        ? messages.intervalAtMost(level, quantity, fmt(high))
        : high === Infinity
          ? messages.intervalAtLeast(level, quantity, fmt(low))
          : messages.intervalBetween(level, quantity, fmt(low), fmt(high)),
    );
  }
  return sentences;
}

/** Test-specific wording for a result without an estimate. */
export interface TestWording {
  /** The statistic's name, e.g. "chi-square". */
  statistic: string;
  /** The "nothing going on" assumption, phrased to follow "If…", e.g. "the rows and columns are unrelated". */
  nullHypothesis: string;
  /** What a small p-value is evidence for, e.g. "the rows and columns are related". */
  claim: string;
}

/** Plain-language sentences for a result that has a statistic and p-value, but no estimate. */
export function explainTest(result: TestResult, wording: TestWording): string[] {
  const p = result.pValue < 0.001 ? messages.pVerySmall : fmt(result.pValue);
  const df =
    result.df === null ? null : typeof result.df === "number" ? fmt(result.df) : result.df.map(fmt).join(" and ");
  return [
    messages.statistic(wording.statistic, fmt(result.statistic), df),
    messages.pValueIf(wording.nullHypothesis, p),
    result.pValue < 0.05
      ? messages.significant(wording.claim)
      : messages.notSignificantThat(wording.claim, wording.nullHypothesis),
  ];
}
