import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { anova } from "../src/index.js";
import type { AnovaOptions } from "../src/index.js";

interface Case {
  name: string;
  input: AnovaOptions;
  expected: { statistic: number; pValue: number; df: [number, number] };
}

const fixtures: { cases: Case[] } = JSON.parse(
  readFileSync(new URL("./fixtures/anova.json", import.meta.url), "utf8"),
);

describe("anova matches SciPy", () => {
  it.each(fixtures.cases)("$name", ({ input, expected }) => {
    const result = anova(input);
    expect(result.statistic).toBeCloseTo(expected.statistic, 10);
    expect(result.pValue).toBeCloseTo(expected.pValue, 10);
    expect(result.df).toEqual(expected.df);
    expect(result.alternative).toBeNull();
  });
});

describe("anova input checks", () => {
  it("rejects fewer than two groups", () => {
    expect(() => anova({ groups: [[1, 2, 3]] })).toThrow(RangeError);
  });

  it("rejects an empty group", () => {
    expect(() => anova({ groups: [[1, 2, 3], []] })).toThrow(RangeError);
  });
});