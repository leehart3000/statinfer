import type { TestWording } from "@/lib/explain";

/**
 * How one-way ANOVA is described in the explanations.
 * Wording shared by all demos is in src/lib/messages.ts.
 */
export const wording = {
  statistic: "F",
  nullHypothesis: "the groups all come from populations with the same mean",
  claim: "at least one group's population mean is different",
} satisfies TestWording;