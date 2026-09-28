/** Every demo page. The header and home page are built from this list. */
export interface Demo {
  /** The page's address, e.g. "t-test" for /t-test. */
  slug: string;
  title: string;
  /** One line for the home page. */
  summary: string;
}

export const demos: Demo[] = [
  {
    slug: "t-test",
    title: "t-test",
    summary: "Compare means: one sample against a target, paired measurements, or two groups.",
  },
  {
    slug: "proportion-test",
    title: "proportion test",
    summary: "Compare proportions: one group against a target, or two groups against each other.",
  },
  {
    slug: "correlation-test",
    title: "correlation test",
    summary: "Measure how strongly two measurements move together, with Pearson's or Spearman's method.",
  },
  {
    slug: "chi-square-test",
    title: "chi-square test",
    summary: "Test counts in categories: whether two factors are related, or whether counts match expected proportions.",
  },
  {
    slug: "anova",
    title: "ANOVA",
    summary: "Compare the averages of three or more groups at once.",
  },
];