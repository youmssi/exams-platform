import { describe, expect, it } from "vitest";
import { isValidBonus, priceBreakdown } from "./pricing";

const b1 = {
  standardPrice: 3000,
  commissionRateBp: 1000,
  commissionMin: 300,
  bonusStep: 500,
  bonusCap: 3000,
};

describe("priceBreakdown", () => {
  it("takes 10 % of the total", () => {
    expect(priceBreakdown({ ...b1, standardPrice: 5000 })).toEqual({
      total: 5000,
      commission: 500,
      assistantShare: 4500,
    });
  });

  it("never takes less than the minimum commission", () => {
    expect(priceBreakdown({ ...b1, standardPrice: 2000 })).toEqual({
      total: 2000,
      commission: 300,
      assistantShare: 1700,
    });
  });

  it("applies the commission to the bonus too", () => {
    expect(priceBreakdown(b1, 2000)).toEqual({
      total: 5000,
      commission: 500,
      assistantShare: 4500,
    });
  });

  it("rounds to the nearest currency unit", () => {
    expect(
      priceBreakdown({ ...b1, standardPrice: 3333, commissionMin: 0 })
        .commission,
    ).toBe(333);
  });

  it("never takes more than the total", () => {
    expect(priceBreakdown({ ...b1, standardPrice: 100 })).toEqual({
      total: 100,
      commission: 100,
      assistantShare: 0,
    });
  });
});

describe("isValidBonus", () => {
  it.each([0, 500, 3000])("accepts %d", (bonus) => {
    expect(isValidBonus(b1, bonus)).toBe(true);
  });

  it.each([-500, 250, 3500, 1.5])("rejects %d", (bonus) => {
    expect(isValidBonus(b1, bonus)).toBe(false);
  });
});
