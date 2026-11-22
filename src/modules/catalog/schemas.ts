import { z } from "zod";
import { isValidBonus } from "./domain/pricing";

/** Messages are translation keys from the `validation` namespace. */
const positiveInt = z.int("integer").positive("positive");
const nonNegativeInt = z.int("integer").nonnegative("nonNegative");
const id = z.string().min(1, "required");

export const countryInput = z.object({
  code: z.string().regex(/^[A-Z]{2}$/, "countryCode"),
  currency: z.string().regex(/^[A-Z]{3}$/, "currencyCode"),
  timeZone: z
    .string()
    .refine(
      (zone) => Intl.supportedValuesOf("timeZone").includes(zone),
      "timeZone",
    ),
  active: z.boolean(),
});

export const centerInput = z.object({
  countryId: id,
  name: z.string().trim().min(1, "required").max(120, "tooLong"),
  city: z.string().trim().min(1, "required").max(80, "tooLong"),
  officialUrl: z.url("url"),
  active: z.boolean(),
});

const offerFields = z.object({
  centerId: id,
  level: z.string().trim().min(1, "required").max(20, "tooLong"),
  modules: z.array(z.string().trim().min(1)).min(1, "modules"),
  standardPrice: positiveInt,
  commissionRateBp: z
    .int("integer")
    .min(0, "nonNegative")
    .max(10_000, "percent"),
  commissionMin: nonNegativeInt,
  bonusStep: positiveInt,
  bonusCap: nonNegativeInt,
  claimTimeoutMin: positiveInt,
  confirmOnlineMin: positiveInt,
  confirmOfflineMin: positiveInt,
  paymentDeadlineH: positiveInt,
  active: z.boolean(),
});

/** The bonus cap must be reachable in whole steps. */
const BONUS_CAP_ISSUE = { path: ["bonusCap"], message: "bonusCapStep" };

export const offerInput = offerFields.refine(
  (offer) => isValidBonus(offer, offer.bonusCap),
  BONUS_CAP_ISSUE,
);

/** What the admin types: commission as a percentage and modules as a comma-separated list. */
export const offerFormSchema = offerFields
  .omit({ commissionRateBp: true, modules: true })
  .extend({
    commissionPercent: z
      .number("number")
      .min(0, "nonNegative")
      .max(100, "percent"),
    modules: z.string().trim().min(1, "modules"),
  })
  .refine((offer) => isValidBonus(offer, offer.bonusCap), BONUS_CAP_ISSUE);
export type OfferFormValues = z.infer<typeof offerFormSchema>;

export const toOfferInput = ({
  commissionPercent,
  modules,
  ...rest
}: OfferFormValues): OfferInput => ({
  ...rest,
  commissionRateBp: Math.round(commissionPercent * 100),
  modules: modules
    .split(",")
    .map((module) => module.trim())
    .filter(Boolean),
});

export const toOfferForm = ({
  commissionRateBp,
  modules,
  ...rest
}: OfferInput): OfferFormValues => ({
  ...rest,
  commissionPercent: commissionRateBp / 100,
  modules: modules.join(", "),
});

export type CountryInput = z.infer<typeof countryInput>;
export type CenterInput = z.infer<typeof centerInput>;
export type OfferInput = z.infer<typeof offerInput>;
