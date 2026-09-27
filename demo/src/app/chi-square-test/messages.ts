import type { TestWording } from "@/lib/explain";

export type Kind = "independence" | "goodness-of-fit";

/**
 * How each kind of chi-square test is described in the explanations.
 * Wording shared by all demos is in src/lib/messages.ts.
 */
export const wording = {
  independence: {
    statistic: "chi-square",
    nullHypothesis: "the rows and columns are unrelated",
    claim: "the rows and columns are related",
  },
  "goodness-of-fit": {
    statistic: "chi-square",
    nullHypothesis: "the counts follow the expected proportions",
    claim: "the counts don't follow the expected proportions",
  },
} satisfies Record<Kind, TestWording>;