import { describe, expect, it } from "vitest";
import { displayName, isReadyToBook } from "./profile";

const complete = {
  firstName: "Danick Ochnielle",
  lastName: "Madjo Tchaou",
  birthDate: new Date("2005-11-11"),
  birthPlace: "Douala",
  phone: "+237 697 47 14 30",
  hasPassword: true,
};

describe("displayName", () => {
  it("puts first names before last names", () => {
    expect(displayName(complete)).toBe("Danick Ochnielle Madjo Tchaou");
  });

  it("ignores a missing first name", () => {
    expect(displayName({ firstName: "", lastName: "Binele" })).toBe("Binele");
  });
});

describe("isReadyToBook", () => {
  it("accepts a complete profile", () => {
    expect(isReadyToBook(complete)).toBe(true);
  });

  it.each([
    ["firstName", ""],
    ["birthDate", null],
    ["birthPlace", null],
    ["phone", null],
    ["hasPassword", false],
  ])("requires %s", (field, value) => {
    expect(isReadyToBook({ ...complete, [field]: value })).toBe(false);
  });
});
