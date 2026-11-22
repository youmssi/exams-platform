import { z } from "zod";

/** Phone number, with or without spaces and country code. Message keys from the `validation` namespace. */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[\d\s.-]{8,20}$/, "phone");

/** A person's name or a place, as typed. */
export const nameSchema = z
  .string()
  .trim()
  .min(1, "required")
  .max(80, "tooLong");
