import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { tTest } from "../src/index.js";
import type { Alternative } from "../src/index.js";

interface Case {
  name: string;
  input: {
    kind: "one-sample" | "paired" | "welch" | "pooled";
    x: number[];
    y?: number[];
    mu?: number;
    alternative: Alternative;
  };
  expected: {
    statistic: number;
    pValue: number;
    df: number;
    estimate: number;
    confidenceInterval: [number | null, number | null];
  };
}

const fixtures: { cases: Case[] } = JSON.parse(
  readFileSync(new URL("./fixtures/ttest.json", import.meta.url), "utf8"),
);

function run({ kind, x, y, mu, alternative }: Case["input"]) {
  switch (kind) {
    case "one-sample":
      return tTest({ x, mu, alternative });
    case "paired":
      return tTest({ x, y, paired: true, alternative });
    case "welch":
      return tTest({ x, y, alternative });
    case "pooled":
      return tTest({ x, y, equalVariance: true, alternative });
  }
}

describe("tTest matches SciPy", () => {
  it.each(fixtures.cases)("$name", ({ input, expected }) => {
    const result = run(input);
    expect(result.statistic).toBeCloseTo(expected.statistic, 10);
    expect(result.pValue).toBeCloseTo(expected.pValue, 10);
    expect(result.df).toBeCloseTo(expected.df, 10);
    expect(result.estimate).toBeCloseTo(expected.estimate, 10);

    const [low, high] = result.confidenceInterval!;
    const [expectedLow, expectedHigh] = expected.confidenceInterval;
    if (expectedLow === null) expect(low).toBe(-Infinity);
    else expect(low).toBeCloseTo(expectedLow, 10);
    if (expectedHigh === null) expect(high).toBe(Infinity);
    else expect(high).toBeCloseTo(expectedHigh, 10);
  });
});

describe("tTest input checks", () => {
  it("rejects paired samples of different lengths", () => {
    expect(() => tTest({ x: [1, 2, 3], y: [1, 2], paired: true })).toThrow(RangeError);
  });

  it("rejects a sample that is too small", () => {
    expect(() => tTest({ x: [1] })).toThrow(RangeError);
  });
});