import { describe, expect, it } from "vitest";
import { initials } from "./initials";

describe("initials", () => {
  it.each([
    ["Awa Ngono", "AN"],
    ["  jean   pierre  essomba ", "JP"],
    ["Ébène", "É"],
    ["", ""],
  ])("%s → %s", (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});
