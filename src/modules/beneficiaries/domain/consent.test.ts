import { describe, expect, it } from "vitest";
import {
  canResendConsent,
  isConsentLinkValid,
  isConsentPending,
} from "./consent";

const now = new Date("2027-01-15T12:00:00Z");
const ago = (ms: number) => new Date(now.getTime() - ms);

describe("consent", () => {
  it("is only needed for friends who have not confirmed", () => {
    expect(isConsentPending({ isSelf: true, consentConfirmedAt: null })).toBe(
      false,
    );
    expect(isConsentPending({ isSelf: false, consentConfirmedAt: null })).toBe(
      true,
    );
    expect(isConsentPending({ isSelf: false, consentConfirmedAt: now })).toBe(
      false,
    );
  });

  it("keeps links valid for 14 days", () => {
    expect(isConsentLinkValid(ago(13 * 86_400_000), now)).toBe(true);
    expect(isConsentLinkValid(ago(14 * 86_400_000), now)).toBe(false);
    expect(isConsentLinkValid(null, now)).toBe(false);
  });

  it("lets the holder resend after 10 minutes", () => {
    expect(canResendConsent(ago(5 * 60_000), now)).toBe(false);
    expect(canResendConsent(ago(10 * 60_000), now)).toBe(true);
    expect(canResendConsent(null, now)).toBe(true);
  });
});
