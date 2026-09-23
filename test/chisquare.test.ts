import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { chiSquareTest } from "../src/index.js";
import type { ChiSquareTestOptions } from "../src/index.js";

interface Case {
  name: string;
  input: ChiSquareTestOptions;
  expected: { statistic: number; pValue: number; df: number };
}

const fixtures: { cases: Case[] } = JSON.parse(
  readFileSync(new URL("./fixtures/chisquare.json", import.meta.url), "utf8"),
);

describe("chiSquareTest matches SciPy", () => {
  it.each(fixtures.cases)("$name", ({ input, expected }) => {
    const result = chiSquareTest(input);
    expect(result.statistic).toBeCloseTo(expected.statistic, 10);
    expect(result.pValue).toBeCloseTo(expected.pValue, 10);
    expect(result.df).toBe(expected.df);
    expect(result.estimate).toBeNull();
    expect(result.confidenceInterval).toBeNull();
    expect(result.alternative).toBeNull();
  });
});

describe("chiSquareTest input checks", () => {
  it("rejects rows of different lengths", () => {
    expect(() => chiSquareTest({ table: [[1, 2], [3]] })).toThrow(RangeError);
  });

  it("rejects proportions that don't add up to 1", () => {
    expect(() => chiSquareTest({ observed: [10, 20], expectedProportions: [0.5, 0.6] })).toThrow(RangeError);
  });
});