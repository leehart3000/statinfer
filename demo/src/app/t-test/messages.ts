export type Kind = "one-sample" | "paired" | "welch" | "pooled";

/**
 * What each kind of t-test estimates, as used in the explanations.
 * Wording shared by all demos is in src/lib/messages.ts.
 */
export const quantity = {
  "one-sample": "true mean",
  paired: "true mean difference (x − y)",
  welch: "true difference in means (x − y)",
  pooled: "true difference in means (x − y)",
} satisfies Record<Kind, string>;