export type Kind = "one-sample" | "two-sample";

/**
 * What each kind of proportion test estimates, as used in the explanations.
 * Wording shared by all demos is in src/lib/messages.ts.
 */
export const quantity = {
  "one-sample": "true proportion",
  "two-sample": "true difference in proportions (group 1 − group 2)",
} satisfies Record<Kind, string>;