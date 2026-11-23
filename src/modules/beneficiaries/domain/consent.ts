/**
 * A friend confirms by email that the account holder may book for them (EXM-024). The holder's own
 * profile needs no confirmation. Links expire, and can be sent again after a short wait.
 */
export const CONSENT_LINK_DAYS = 14;
export const CONSENT_RESEND_MINUTES = 10;

export const isConsentPending = (beneficiary: {
  isSelf: boolean;
  consentConfirmedAt: Date | null;
}) => !beneficiary.isSelf && !beneficiary.consentConfirmedAt;

export const isConsentLinkValid = (
  requestedAt: Date | null,
  now = new Date(),
) =>
  Boolean(
    requestedAt &&
      now.getTime() - requestedAt.getTime() < CONSENT_LINK_DAYS * 86_400_000,
  );

export const canResendConsent = (requestedAt: Date | null, now = new Date()) =>
  !requestedAt ||
  now.getTime() - requestedAt.getTime() >= CONSENT_RESEND_MINUTES * 60_000;
