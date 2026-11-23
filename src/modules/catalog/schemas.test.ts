import { describe, expect, it } from "vitest";
import {
  countryFormSchema,
  countryInput,
  offerInput,
  toCountryForm,
  toCountryInput,
  toOfferForm,
  toOfferInput,
} from "./schemas";

const offer = {
  centerId: "center_1",
  level: "B1",
  modules: ["Lesen", "Hören"],
  standardPrice: 3000,
  commissionRateBp: 1000,
  commissionMin: 300,
  bonusStep: 500,
  bonusCap: 3000,
  claimTimeoutMin: 20,
  confirmOnlineMin: 15,
  confirmOfflineMin: 5,
  paymentDeadlineH: 24,
  centerFeeDays: 3,
  active: true,
};

describe("offerInput", () => {
  it("accepts the starting B1 offer", () => {
    expect(offerInput.safeParse(offer).success).toBe(true);
  });

  it("rejects a bonus cap that is not a multiple of the step", () => {
    const result = offerInput.safeParse({ ...offer, bonusCap: 1250 });
    expect(result.error?.issues[0]).toMatchObject({
      path: ["bonusCap"],
      message: "bonusCapStep",
    });
  });
});

describe("offer form mapping", () => {
  it("converts the percentage and the module list both ways", () => {
    const form = toOfferForm(offer);
    expect(form).toMatchObject({
      commissionPercent: 10,
      modules: "Lesen, Hören",
    });
    expect(
      toOfferInput({
        ...form,
        commissionPercent: 12.5,
        modules: " Lesen ,, Hören ",
      }),
    ).toEqual({
      ...offer,
      commissionRateBp: 1250,
    });
  });
});

describe("countryInput", () => {
  it("validates ISO codes and the time zone", () => {
    expect(
      countryInput.safeParse({
        code: "CM",
        currency: "XAF",
        timeZone: "Africa/Douala",
        mobileMoneyOperators: ["MTN Mobile Money", "Orange Money"],
        platformOperator: null,
        platformMomoNumber: null,
        platformMomoName: null,
        active: true,
      }).success,
    ).toBe(true);
    expect(
      countryInput.safeParse({
        code: "cm",
        currency: "XAF",
        timeZone: "Africa/Douala",
        mobileMoneyOperators: ["MTN Mobile Money", "Orange Money"],
        active: true,
      }).success,
    ).toBe(false);
    expect(
      countryInput.safeParse({
        code: "CM",
        currency: "XAF",
        timeZone: "Mars/Base",
        active: true,
      }).success,
    ).toBe(false);
  });
});

describe("country form", () => {
  it("round-trips Mobile Money operators as comma-separated text", () => {
    const country = {
      code: "CM",
      currency: "XAF",
      timeZone: "Africa/Douala",
      mobileMoneyOperators: ["MTN Mobile Money", "Orange Money"],
      platformOperator: null,
      platformMomoNumber: null,
      platformMomoName: null,
      active: true,
    };
    expect(toCountryForm(country).mobileMoneyOperators).toBe(
      "MTN Mobile Money, Orange Money",
    );
    expect(
      toCountryInput({
        ...toCountryForm(country),
        mobileMoneyOperators: " A ,, B ",
      }).mobileMoneyOperators,
    ).toEqual(["A", "B"]);
  });

  it("keeps the platform account empty or complete", () => {
    const empty = {
      code: "CM",
      currency: "XAF",
      timeZone: "Africa/Douala",
      mobileMoneyOperators: "MTN Mobile Money",
      platformOperator: "",
      platformMomoNumber: "",
      platformMomoName: "",
      active: true,
    };
    expect(countryFormSchema.safeParse(empty).success).toBe(true);
    expect(toCountryInput(empty).platformOperator).toBeNull();
    expect(
      countryFormSchema.safeParse({ ...empty, platformOperator: "MTN" })
        .success,
    ).toBe(false);
    expect(
      countryFormSchema.safeParse({
        ...empty,
        platformOperator: "MTN Mobile Money",
        platformMomoNumber: "6 70 00 00 00",
        platformMomoName: "Exams",
      }).success,
    ).toBe(true);
  });
});
