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
  /** Mobile Money operators assistants are paid with (assistant profile). */
  mobileMoneyOperators: z.array(z.string().trim().min(1)),
  /** Where candidates send the platform's commission; all three or none. */
  platformOperator: z.string().trim().max(60, "tooLong").nullable(),
  platformMomoNumber: z.string().trim().max(30, "tooLong").nullable(),
  platformMomoName: z.string().trim().max(80, "tooLong").nullable(),
  active: z.boolean(),
});

/** Lists the admin types as comma-separated text (modules, operators). */
const splitList = (text: string) =>
  text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
const joinList = (items: string[]) => items.join(", ");

const PLATFORM_ACCOUNT = [
  "platformOperator",
  "platformMomoNumber",
  "platformMomoName",
] as const;

export const countryFormSchema = countryInput
  .extend({
    mobileMoneyOperators: z.string(),
    platformOperator: z.string().trim().max(60, "tooLong"),
    platformMomoNumber: z.string().trim().max(30, "tooLong"),
    platformMomoName: z.string().trim().max(80, "tooLong"),
  })
  .refine(
    (values) =>
      new Set(PLATFORM_ACCOUNT.map((key) => values[key] === "")).size === 1,
    { path: ["platformMomoNumber"], message: "allOrNone" },
  );
export type CountryFormValues = z.infer<typeof countryFormSchema>;
export const toCountryInput = ({
  mobileMoneyOperators,
  platformOperator,
  platformMomoNumber,
  platformMomoName,
  ...rest
}: CountryFormValues): CountryInput => ({
  ...rest,
  mobileMoneyOperators: splitList(mobileMoneyOperators),
  platformOperator: platformOperator || null,
  platformMomoNumber: platformMomoNumber || null,
  platformMomoName: platformMomoName || null,
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
  /** Days the centre gives to pay exam fees after booking; 0 hides the reminder. */
  centerFeeDays: nonNegativeInt,
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
  modules: splitList(modules),
});

export const toOfferForm = ({
  commissionRateBp,
  modules,
  ...rest
}: OfferInput): OfferFormValues => ({
  ...rest,
  commissionPercent: commissionRateBp / 100,
  modules: joinList(modules),
});

export type CountryInput = z.infer<typeof countryInput>;
export const toCountryForm = ({
  mobileMoneyOperators,
  platformOperator,
  platformMomoNumber,
  platformMomoName,
  ...rest
}: CountryInput): CountryFormValues => ({
  ...rest,
  mobileMoneyOperators: joinList(mobileMoneyOperators),
  platformOperator: platformOperator ?? "",
  platformMomoNumber: platformMomoNumber ?? "",
  platformMomoName: platformMomoName ?? "",
});
export type CenterInput = z.infer<typeof centerInput>;
export type OfferInput = z.infer<typeof offerInput>;

const localDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date");
const localDateTime = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "dateTime");

/** Dates are typed in the centre's time zone; the server converts them to UTC. */
export const sessionInput = z
  .object({
    offerId: id,
    examDate: localDate,
    registrationOpensAt: localDateTime,
    officialUrl: z.union([z.url("url"), z.literal("")]),
  })
  .refine(
    (session) => session.registrationOpensAt.slice(0, 10) <= session.examDate,
    {
      path: ["registrationOpensAt"],
      message: "opensAfterExam",
    },
  );
export type SessionInput = z.infer<typeof sessionInput>;

export const CATALOG_REQUEST_KINDS = [
  "COUNTRY",
  "CENTER",
  "LEVEL",
  "OTHER",
] as const;

export const catalogRequestInput = z.object({
  kind: z.enum(CATALOG_REQUEST_KINDS),
  details: z.string().trim().min(5, "tooShort").max(1000, "tooLong"),
  officialUrl: z.union([z.url("url"), z.literal("")]),
});
export type CatalogRequestInput = z.infer<typeof catalogRequestInput>;
