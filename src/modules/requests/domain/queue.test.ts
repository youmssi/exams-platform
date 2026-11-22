import { describe, expect, it } from "vitest";
import { compareQueue } from "./queue";

const at = (minute: number) => new Date(Date.UTC(2027, 0, 1, 9, minute));

describe("compareQueue", () => {
  it("puts a higher bonus first", () => {
    const rows = [
      { id: "a", bonus: 0, publishAt: at(0) },
      { id: "b", bonus: 500, publishAt: at(5) },
    ];
    expect(rows.sort(compareQueue).map((row) => row.id)).toEqual(["b", "a"]);
  });

  it("puts the oldest first for an equal bonus", () => {
    const rows = [
      { id: "a", bonus: 500, publishAt: at(5) },
      { id: "b", bonus: 500, publishAt: at(1) },
    ];
    expect(rows.sort(compareQueue).map((row) => row.id)).toEqual(["b", "a"]);
  });
});
