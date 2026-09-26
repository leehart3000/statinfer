import type { Alternative } from "statinfer";

export type Kind = "one-sample" | "paired" | "welch" | "pooled";

/**
 * Wording for the t-test demo's generated explanations.
 * Each function fills a sentence template with the numbers from a result.
 */
export const messages = {
  quantity: {
    "one-sample": "true mean",
    paired: "true mean difference (x − y)",
    welch: "true difference in means (x − y)",
    pooled: "true difference in means (x − y)",
  } satisfies Record<Kind, string>,

  claim: {
    "two-sided": (quantity: string, mu: number) => `the ${quantity} differs from ${mu}`,
    less: (quantity: string, mu: number) => `the ${quantity} is less than ${mu}`,
    greater: (quantity: string, mu: number) => `the ${quantity} is greater than ${mu}`,
  } satisfies Record<Alternative, (quantity: string, mu: number) => string>,

  estimate: (value: string) => `The estimate from your data is ${value}.`,

  pValue: (quantity: string, mu: number, p: string) =>
    `If the ${quantity} really were ${mu}, the chance of getting a result at least this extreme is ${p}. That's the p-value.`,

  pVerySmall: "less than 0.001",

  significant: (claim: string) =>
    `That's below 0.05, so at the common 5% level this counts as evidence that ${claim}.`,

  notSignificant: (claim: string, mu: number) =>
    `That's not below 0.05, so at the common 5% level there isn't enough evidence that ${claim}. That doesn't prove it equals ${mu}; the data just can't tell.`,

  intervalAtMost: (level: string, quantity: string, high: string) =>
    `The ${level} confidence interval says the ${quantity} is at most ${high}.`,

  intervalAtLeast: (level: string, quantity: string, low: string) =>
    `The ${level} confidence interval says the ${quantity} is at least ${low}.`,

  intervalBetween: (level: string, quantity: string, low: string, high: string) =>
    `The ${level} confidence interval, ${low} to ${high}, is the range of values for the ${quantity} that are consistent with your data.`,

  needsValidData: "Enter valid data above to see this.",
};