import { describe, it, expect } from "vitest";
import { summarize, tTest } from "../src/index.js";
import type { TestResult } from "../src/index.js";

const welch: TestResult = {
  method: "Welch two-sample t-test",
  statistic: 2.345678,
  pValue: 0.0321456,
  df: 13.8912,
  estimate: 0.55,
  confidenceInterval: [0.05123, 1.04877],
  confidenceLevel: 0.95,
  alternative: "two-sided",
};

describe("summarize", () => {
  it("formats a full result as an aligned table", () => {
    expect(summarize(welch)).toBe(
      [
        "Welch two-sample t-test",
        "=".repeat("Welch two-sample t-test".length),
        "statistic    2.346",
        "p-value      0.03215",
        "df           13.89",
        "estimate     0.55",
        "95% CI       [0.05123, 1.049]",
        "alternative  two-sided",
      ].join("\n"),
    );
  });

  it("leaves out fields that don't apply, and uses exponent form for tiny p-values", () => {
    const output = summarize({
      ...welch,
      method: "Chi-square test of independence",
      statistic: 4.5,
      pValue: 1.2e-7,
      df: 2,
      estimate: null,
      confidenceInterval: null,
      confidenceLevel: null,
      alternative: null,
    });
    expect(output).toContain("p-value    1.200e-7");
    expect(output).not.toContain("estimate");
    expect(output).not.toContain("CI");
    expect(output).not.toContain("alternative");
  });

  it("shows two degrees of freedom and infinite interval ends", () => {
    const output = summarize({ ...welch, df: [2, 12], confidenceInterval: [0.1, Infinity] });
    expect(output).toContain("df           2, 12");
    expect(output).toContain("95% CI       [0.1, Inf]");
  });

  it("respects the digits option", () => {
    expect(summarize(welch, { digits: 2 })).toContain("statistic    2.3");
  });

  it("works on a real test result", () => {
    const output = summarize(tTest({ x: [5.1, 4.9, 5.6, 5.8, 6.0, 5.5, 5.3, 6.2], mu: 5 }));
    expect(output.split("\n")[0]).toBe("One-sample t-test");
  });
});