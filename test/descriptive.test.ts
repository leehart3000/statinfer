import { describe, it, expect } from "vitest";
import { mean, variance, standardDeviation } from "../src/index.js";

describe("mean", () => {
  it("returns the average of the values", () => {
    expect(mean([1, 2, 3])).toBe(2);
  });

  it("works with a single value", () => {
    expect(mean([5])).toBe(5);
  });

  it("handles decimals within floating-point accuracy", () => {
    expect(mean([0.1, 0.2, 0.3])).toBeCloseTo(0.2);
  });

  it("throws on an empty array", () => {
    expect(() => mean([])).toThrow(RangeError);
  });
});

describe("variance", () => {
  it("returns the sample variance", () => {
    expect(variance([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(32 / 7);
  });

  it("throws with fewer than two values", () => {
    expect(() => variance([1])).toThrow(RangeError);
  });
});

describe("standardDeviation", () => {
  it("is the square root of the variance", () => {
    expect(standardDeviation([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(Math.sqrt(32 / 7));
  });
});