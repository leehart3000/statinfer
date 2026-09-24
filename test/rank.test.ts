import { describe, it, expect } from "vitest";
import { rank } from "../src/rank.js";

describe("rank", () => {
  it("ranks distinct values", () => {
    expect(rank([30, 10, 20])).toEqual([3, 1, 2]);
  });

  it("gives tied values the average of their ranks", () => {
    expect(rank([10, 20, 20, 30])).toEqual([1, 2.5, 2.5, 4]);
  });
});