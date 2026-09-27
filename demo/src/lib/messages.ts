import type { Alternative } from "statinfer";

/**
 * Wording shared by every demo's explanations. Each function fills a
 * sentence template with numbers from a result. Test-specific wording
 * (like what the test estimates) lives in each demo's own messages.ts.
 */
export const messages = {
  claim: {
    "two-sided": (quantity: string, value: number) => `the ${quantity} differs from ${value}`,
    less: (quantity: string, value: number) => `the ${quantity} is less than ${value}`,
    greater: (quantity: string, value: number) => `the ${quantity} is greater than ${value}`,
  } satisfies Record<Alternative, (quantity: string, value: number) => string>,

  estimate: (value: string) => `The estimate from the demo data entered above is ${value}.`,

  pValue: (quantity: string, value: number, p: string) =>
    `If the ${quantity} really were ${value}, the chance of getting a result at least this extreme is ${p}. That's the p-value.`,

  pVerySmall: "less than 0.001",

  significant: (claim: string) =>
    `That's below 0.05, so at the common 5% level this counts as evidence that ${claim}.`,

  notSignificant: (claim: string, value: number) =>
    `That's not below 0.05, so at the common 5% level there isn't enough evidence that ${claim}. That doesn't prove it equals ${value}; the data just can't tell.`,

  intervalAtMost: (level: string, quantity: string, high: string) =>
    `The ${level} confidence interval says the ${quantity} is at most ${high}.`,

  intervalAtLeast: (level: string, quantity: string, low: string) =>
    `The ${level} confidence interval says the ${quantity} is at least ${low}.`,

  intervalBetween: (level: string, quantity: string, low: string, high: string) =>
    `The ${level} confidence interval, ${low} to ${high}, is the range of values for the ${quantity} that are consistent with the demo data entered above.`,

  needsValidData: "Enter valid data above to see this.",
};