/**
 * Price rules of an offer. Amounts are integers in the currency unit (XAF: 3000 = 3 000 FCFA);
 * the commission rate is in basis points (1000 = 10 %).
 */
export type PricingSettings = {
  standardPrice: number;
  commissionRateBp: number;
  commissionMin: number;
  bonusStep: number;
  bonusCap: number;
};

export type PriceBreakdown = {
  total: number;
  commission: number;
  assistantShare: number;
};

const BASIS_POINTS = 10_000;

/** The candidate pays one total; the platform takes its commission (never below the minimum) from it. */
export function priceBreakdown(
  settings: PricingSettings,
  bonus = 0,
): PriceBreakdown {
  const total = settings.standardPrice + bonus;
  const commission = Math.min(
    total,
    Math.max(
      Math.round((total * settings.commissionRateBp) / BASIS_POINTS),
      settings.commissionMin,
    ),
  );
  return { total, commission, assistantShare: total - commission };
}

/** A bonus is a non-negative multiple of the step, up to the cap. */
export function isValidBonus(
  settings: Pick<PricingSettings, "bonusStep" | "bonusCap">,
  bonus: number,
) {
  return (
    Number.isInteger(bonus) &&
    bonus >= 0 &&
    bonus <= settings.bonusCap &&
    bonus % settings.bonusStep === 0
  );
}
