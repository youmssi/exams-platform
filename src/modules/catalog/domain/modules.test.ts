import { describe, expect, it } from "vitest";
import { bookedModules, isFullExam } from "./modules";

const goethe = ["Lesen", "Hören", "Schreiben", "Sprechen"];

describe("bookedModules", () => {
  it("keeps the offer's order", () => {
    expect(bookedModules(goethe, ["Sprechen", "Lesen"])).toEqual([
      "Lesen",
      "Sprechen",
    ]);
  });

  it("removes duplicates", () => {
    expect(bookedModules(goethe, ["Lesen", "Lesen"])).toEqual(["Lesen"]);
  });

  it("rejects an empty choice", () => {
    expect(bookedModules(goethe, [])).toBeNull();
  });

  it("rejects a module the offer does not have", () => {
    expect(bookedModules(goethe, ["Lesen", "Grammatik"])).toBeNull();
  });
});

describe("isFullExam", () => {
  it("is true when every module is booked", () => {
    expect(isFullExam(goethe, goethe)).toBe(true);
  });

  it("is false for a partial booking", () => {
    expect(isFullExam(goethe, ["Lesen", "Hören"])).toBe(false);
  });
});
