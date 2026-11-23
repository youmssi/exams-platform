import { describe, expect, it } from "vitest";
import { reachesSuspension, strikeCount } from "./strikes";

describe("strikes", () => {
  it("suspends at the threshold, not before", () => {
    expect(reachesSuspension(2, 3)).toBe(false);
    expect(reachesSuspension(3, 3)).toBe(true);
  });

  it("caps the counter at the threshold", () => {
    expect(strikeCount(4, 3)).toEqual({ count: 3, threshold: 3 });
    expect(strikeCount(1, 3)).toEqual({ count: 1, threshold: 3 });
  });
});
