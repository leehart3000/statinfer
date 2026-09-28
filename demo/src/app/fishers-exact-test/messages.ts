/**
 * What Fisher's exact test estimates, as used in the explanations.
 * Wording shared by all demos is in src/lib/messages.ts.
 */
export const quantity = "true odds ratio";

/** Explanations for odds ratios that aren't ordinary numbers. */
export const oddsRatioNotes = {
  undefined:
    "The odds ratio can't be calculated from the demo data entered above, because a whole row or column of the table is zero. With nothing on one side to compare against, the data can't show a relationship in either direction, so the p-value is always 1.",
  infinite:
    "The odds ratio in the demo data entered above is infinite, because the top-right or bottom-left count is zero: the counts off the diagonal give it nothing to divide by.",
};