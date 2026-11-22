import { describe, expect, it } from "vitest";
import { CONFIRMATIONS_TO_VERIFY, isConfirmedBy } from "./sessions";

describe("isConfirmedBy", () => {
  it("needs the configured number of confirmations", () => {
    expect(isConfirmedBy(CONFIRMATIONS_TO_VERIFY - 1)).toBe(false);
    expect(isConfirmedBy(CONFIRMATIONS_TO_VERIFY)).toBe(true);
  });
});
