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