import { describe, expect, it } from "vitest";
import { canAddBeneficiary, MAX_BENEFICIARIES } from "./limits";

describe("canAddBeneficiary", () => {
  it("allows up to the limit and no more", () => {
    expect(canAddBeneficiary(MAX_BENEFICIARIES - 1)).toBe(true);
    expect(canAddBeneficiary(MAX_BENEFICIARIES)).toBe(false);
  });
});
