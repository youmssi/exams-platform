import { describe, expect, it } from "vitest";
import { routes, safeNextPath } from "./routes";

describe("safeNextPath", () => {
  it("keeps an in-app path", () => {
    expect(safeNextPath("/account?tab=devices")).toBe("/account?tab=devices");
  });

  it.each([
    null,
    undefined,
    "",
    "https://evil.example",
    "//evil.example",
    "account",
  ])("falls back to home for %s", (value) => {
    expect(safeNextPath(value)).toBe(routes.home);
  });
});
