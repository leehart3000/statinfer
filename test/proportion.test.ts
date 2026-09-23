import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { proportionTest } from "../src/index.js";
import type { Alternative } from "../src/index.js";

interface Case {
  name: string;
  input: {
    successes: number | [number, number];
    trials: number | [number, number];
    p?: number;
    alternative: Alternative;
  };
  expected: {
    statistic: number;
    pValue: number;
    estimate: number;
    confidenceInterval: [number, number];
  };
}

const fixtures: { cases: Case[] } = JSON.parse(
  readFileSync(new URL("./fixtures/proportion.json", import.meta.url), "utf8"),
);

describe("proportionTest matches statsmodels", () => {
  it.each(fixtures.cases)("$name", ({ input, expected }) => {
    const result = proportionTest(input);
    expect(result.statistic).toBeCloseTo(expected.statistic, 10);
    expect(result.pValue).toBeCloseTo(expected.pValue, 10);
    expect(result.estimate).toBeCloseTo(expected.estimate, 10);
    expect(result.df).toBeNull();
    expect(result.confidenceInterval![0]).toBeCloseTo(expected.confidenceInterval[0], 10);
    expect(result.confidenceInterval![1]).toBeCloseTo(expected.confidenceInterval[1], 10);
  });
});

describe("proportionTest input checks", () => {
  it("rejects more successes than trials", () => {
    expect(() => proportionTest({ successes: 11, trials: 10 })).toThrow(RangeError);
  });

  it("rejects mixing a number with a pair", () => {
    expect(() => proportionTest({ successes: 5, trials: [10, 10] })).toThrow(TypeError);
  });
});