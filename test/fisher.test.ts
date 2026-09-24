import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { fishersExactTest } from "../src/index.js";
import type { FishersExactTestOptions } from "../src/index.js";

interface Case {
  name: string;
  input: FishersExactTestOptions;
  expected: { statistic: number; pValue: number; estimate: number };
}

const fixtures: { cases: Case[] } = JSON.parse(
  readFileSync(new URL("./fixtures/fisher.json", import.meta.url), "utf8"),
);

describe("fishersExactTest matches SciPy", () => {
  it.each(fixtures.cases)("$name", ({ input, expected }) => {
    const result = fishersExactTest(input);
    expect(result.statistic).toBe(expected.statistic);
    expect(result.pValue).toBeCloseTo(expected.pValue, 10);
    expect(result.estimate).toBeCloseTo(expected.estimate, 10);
    expect(result.df).toBeNull();
  });
});

describe("fishersExactTest input checks", () => {
  it("rejects negative counts", () => {
    expect(() => fishersExactTest({ table: [[-1, 2], [3, 4]] })).toThrow(RangeError);
  });

  it("rejects non-whole counts", () => {
    expect(() => fishersExactTest({ table: [[1.5, 2], [3, 4]] })).toThrow(RangeError);
  });
});