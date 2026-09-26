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
];