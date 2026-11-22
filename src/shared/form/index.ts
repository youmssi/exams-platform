import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "./context";
import { CheckboxField, ChoiceCardsField, OtpField, TextField } from "./fields";
import { SubmitButton } from "./submit-button";

/**
 * The project's single form hook: TanStack Form bound to shadcn `Field` components.
 * @see docs/ui/component-map.md
 */
export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField, OtpField, CheckboxField, ChoiceCardsField },
  formComponents: { SubmitButton },
});
