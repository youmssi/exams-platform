import { describe, expect, it } from "vitest";
import { onboardingSchema, otpSchema, toRole } from "./schemas";

describe("toRole", () => {
  it("keeps assistant and defaults everything else to candidate", () => {
    expect(toRole("assistant")).toBe("assistant");
    expect(toRole("candidate")).toBe("candidate");
    expect(toRole(null)).toBe("candidate");
    expect(toRole("admin")).toBe("candidate");
  });
});

describe("otpSchema", () => {
  it("accepts exactly six digits", () => {
    expect(otpSchema.safeParse("123456").success).toBe(true);
    expect(otpSchema.safeParse("12345").success).toBe(false);
    expect(otpSchema.safeParse("12345a").success).toBe(false);
  });
});

describe("onboardingSchema", () => {
  it("requires the terms to be accepted", () => {
    const result = onboardingSchema.safeParse({
      name: "Awa",
      role: "candidate",
      acceptTerms: false,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("termsRequired");
  });

  it("trims the name", () => {
    const result = onboardingSchema.parse({
      name: "  Awa  ",
      role: "assistant",
      acceptTerms: true,
    });
    expect(result.name).toBe("Awa");
  });
});
