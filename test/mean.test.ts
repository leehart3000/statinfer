import { describe, it, expect } from "vitest";
import { mean } from "../src/index.js";

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