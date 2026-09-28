/** One step of the "which test should I use?" guide: a question, or a recommendation. */
export type GuideNode =
  | { question: string; answers: { label: string; next: string }[] }
  | { title: string; href: string; note: string };

/** The guide, as named steps. Each answer names the step it leads to. */
export const guide: Record<string, GuideNode> = {
  start: {
    question: "What kind of data do you have?",
    answers: [
      { label: "Measurements, like heights, times or scores", next: "measurements" },
      { label: "Counts, or yes/no outcomes", next: "counts" },
    ],
  },
  measurements: {
    question: "What do you want to find out?",
    answers: [
      { label: "Whether one group's average differs from a target value", next: "oneSampleT" },
      { label: "Whether the same subjects changed between two measurements", next: "pairedT" },
      { label: "Whether two separate groups have different averages", next: "welchT" },
      { label: "Whether three or more groups have different averages", next: "anova" },
      { label: "Whether two measurements move together", next: "correlation" },
    ],
  },
  counts: {
    question: "What do you want to find out?",
    answers: [
      { label: "Whether one proportion differs from a target value", next: "oneProportion" },
      { label: "Whether two groups have different proportions", next: "twoProportionsSize" },
      { label: "Whether the rows and columns of a table of counts are related", next: "tableSize" },
      { label: "Whether counts match expected proportions", next: "goodnessOfFit" },
    ],
  },
  twoProportionsSize: {
    question: "Does each group have at least 10 successes and 10 failures?",
    answers: [
      { label: "Yes", next: "twoProportions" },
      { label: "No, some counts are small", next: "fisher" },
    ],
  },
  tableSize: {
    question: "Is it a 2×2 table where some counts are small (below about 5)?",
    answers: [
      { label: "No", next: "chiIndependence" },
      { label: "Yes", next: "fisher" },
    ],
  },
  oneSampleT: { title: "t-test", href: "/t-test", note: "Choose One-sample in the demo." },
  pairedT: { title: "t-test", href: "/t-test", note: "Choose Paired in the demo." },
  welchT: {
    title: "t-test",
    href: "/t-test",
    note: "Choose Two-sample (Welch), the usual choice for two groups.",
  },
  anova: { title: "ANOVA", href: "/anova", note: "It compares all the groups at once." },
  correlation: {
    title: "correlation test",
    href: "/correlation-test",
    note: "Use Pearson for straight-line relationships, or Spearman if there are outliers or the trend is curved.",
  },
  oneProportion: { title: "proportion test", href: "/proportion-test", note: "Choose One sample in the demo." },
  twoProportions: { title: "proportion test", href: "/proportion-test", note: "Choose Two samples in the demo." },
  fisher: {
    title: "Fisher's exact test",
    href: "/fishers-exact-test",
    note: "It's exact, so it stays reliable when counts are small.",
  },
  chiIndependence: {
    title: "chi-square test",
    href: "/chi-square-test",
    note: "Choose Independence in the demo.",
  },
  goodnessOfFit: {
    title: "chi-square test",
    href: "/chi-square-test",
    note: "Choose Goodness-of-fit in the demo.",
  },
};