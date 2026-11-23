import { describe, expect, it } from "vitest";
import { shouldEmail } from "./channels";

describe("shouldEmail", () => {
  it("always sends critical emails", () => {
    expect(shouldEmail("STRIKE", false)).toBe(true);
    expect(shouldEmail("PAYMENT_REJECTED", false)).toBe(true);
  });

  it("sends follow-up emails only when the user keeps them", () => {
    expect(shouldEmail("BOOKING_DECLARED", true)).toBe(true);
    expect(shouldEmail("BOOKING_DECLARED", false)).toBe(false);
  });

  it("keeps the rest in the app", () => {
    expect(shouldEmail("REQUEST_CLAIMED", true)).toBe(false);
  });
});
