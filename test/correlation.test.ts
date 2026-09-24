import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { correlationTest } from "../src/index.js";
import type { CorrelationTestOptions } from "../src/index.js";

interface Case {
  name: string;
  input: CorrelationTestOptions;
  expected: {
    estimate: number;
    statistic: number;
    pValue: number;
    df: number;
    confidenceInterval: [number, number] | null;
  };
}

const fixtures: { cases: Case[] } = JSON.parse(
  readFileSync(new URL("./fixtures/correlation.json", import.meta.url), "utf8"),
);

describe("correlationTest matches SciPy", () => {
  it.each(fixtures.cases)("$name", ({ input, expected }) => {
    const result = correlationTest(input);
    expect(result.estimate).toBeCloseTo(expected.estimate, 10);
    expect(result.statistic).toBeCloseTo(expected.statistic, 10);
    expect(result.pValue).toBeCloseTo(expected.pValue, 10);
    expect(result.df).toBe(expected.df);

    if (expected.confidenceInterval === null) {
      expect(result.confidenceInterval).toBeNull();
    } else {
      expect(result.confidenceInterval![0]).toBeCloseTo(expected.confidenceInterval[0], 10);
      expect(result.confidenceInterval![1]).toBeCloseTo(expected.confidenceInterval[1], 10);
    }
  });
});

describe("correlationTest input checks", () => {
  it("rejects x and y of different lengths", () => {
    expect(() => correlationTest({ x: [1, 2, 3], y: [1, 2] })).toThrow(RangeError);
  });

  it("rejects constant data", () => {
    expect(() => correlationTest({ x: [1, 1, 1], y: [1, 2, 3] })).toThrow(RangeError);
  });
});