"use client";

import type { ComponentProps, ReactNode } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useFieldErrors } from "./use-field-errors";

type TextFieldProps = Omit<
  ComponentProps<typeof Input>,
  "value" | "onChange" | "onBlur" | "name" | "id"
> & {
  label: ReactNode;
  description?: ReactNode;
};

export function TextField({
  label,
  description,
  ...inputProps
}: TextFieldProps) {
  const { field, isInvalid, errors } = useFieldErrors();
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value as string}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        aria-invalid={isInvalid}
        {...inputProps}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  );
}

export function OtpField({
  label,
  length,
}: {
  label: ReactNode;
  length: number;
}) {
  const { field, isInvalid, errors } = useFieldErrors();
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <InputOTP
        id={field.name}
        maxLength={length}
        value={field.state.value as string}
        onChange={(value) => field.handleChange(value)}
        onBlur={field.handleBlur}
        autoComplete="one-time-code"
        inputMode="numeric"
        aria-invalid={isInvalid}
        autoFocus
      >
        <InputOTPGroup>
          {Array.from({ length }, (_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: slots are positional
            <InputOTPSlot key={index} index={index} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <FieldError errors={errors} />
    </Field>
  );
}

export function CheckboxField({
  label,
  description,
}: {
  label: ReactNode;
  description?: ReactNode;
}) {
  const { field, isInvalid, errors } = useFieldErrors();
  return (
    <Field orientation="horizontal" data-invalid={isInvalid}>
      <Checkbox
        id={field.name}
        name={field.name}
        checked={field.state.value as boolean}
        onCheckedChange={(checked) => field.handleChange(checked)}
        aria-invalid={isInvalid}
      />
      <FieldContent>
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        {description && <FieldDescription>{description}</FieldDescription>}
        <FieldError errors={errors} />
      </FieldContent>
    </Field>
  );
}

type ChoiceOption = {
  value: string;
  title: ReactNode;
  description?: ReactNode;
};

/** Radio group rendered as selectable cards (shadcn field choice-card pattern). */
export function ChoiceCardsField({
  legend,
  options,
}: {
  legend: ReactNode;
  options: ChoiceOption[];
}) {
  const { field, isInvalid, errors } = useFieldErrors();
  return (
    <FieldSet data-invalid={isInvalid}>
      <FieldLegend variant="label">{legend}</FieldLegend>
      <RadioGroup
        name={field.name}
        value={field.state.value as string}
        onValueChange={(value) => field.handleChange(value)}
      >
        {options.map((option) => {
          const id = `${field.name}-${option.value}`;
          return (
            <FieldLabel key={option.value} htmlFor={id}>
              <Field orientation="horizontal">
                <RadioGroupItem value={option.value} id={id} />
                <FieldContent>
                  <FieldTitle>{option.title}</FieldTitle>
                  {option.description && (
                    <FieldDescription>{option.description}</FieldDescription>
                  )}
                </FieldContent>
              </Field>
            </FieldLabel>
          );
        })}
      </RadioGroup>
      <FieldError errors={errors} />
    </FieldSet>
  );
}
