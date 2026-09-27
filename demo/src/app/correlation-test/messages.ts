export type Method = "pearson" | "spearman";

/**
 * What each correlation method estimates, as used in the explanations.
 * Wording shared by all demos is in src/lib/messages.ts.
 */
export const quantity = {
  pearson: "true correlation (Pearson's r)",
  spearman: "true rank correlation (Spearman's rho)",
} satisfies Record<Method, string>;