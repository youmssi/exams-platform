"use client";

import { useTranslations } from "next-intl";
import { useFieldContext } from "./context";

/**
 * Invalid state and translated messages of the current field.
 * Schema messages are keys of the `validation` namespace.
 */
export function useFieldErrors() {
  const field = useFieldContext();
  const t = useTranslations("validation");
  const { isTouched, isValid, errors } = field.state.meta;
  const isInvalid = isTouched && !isValid;
  const messages = isInvalid
    ? errors.map((error) => ({
        message: t(
          typeof error === "string" ? error : (error?.message ?? "invalid"),
        ),
      }))
    : [];
  return { field, isInvalid, errors: messages };
}
