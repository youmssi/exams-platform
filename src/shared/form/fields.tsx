"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ComponentProps, type ReactNode, useState } from "react";
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
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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

type NumberFieldProps = {
  label: ReactNode;
  description?: ReactNode;
  /** Unit shown after the value, e.g. "FCFA", "%", "min". */
  unit?: ReactNode;
  step?: number;
  min?: number;
};

export function NumberField({
  label,
  description,
  unit,
  step = 1,
  min = 0,
}: NumberFieldProps) {
  const { field, isInvalid, errors } = useFieldErrors();
  const value = field.state.value as number;
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={field.name}
          name={field.name}
          type="number"
          inputMode="numeric"
          step={step}
          min={min}
          value={Number.isNaN(value) ? "" : value}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.valueAsNumber)}
          aria-invalid={isInvalid}
        />
        {unit && (
          <InputGroupAddon align="inline-end">
            <InputGroupText>{unit}</InputGroupText>
          </InputGroupAddon>
        )}
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  );
}

type SelectFieldProps = {
  label: ReactNode;
  placeholder?: string;
  items: { value: string; label: string }[];
};

export function SelectField({ label, placeholder, items }: SelectFieldProps) {
  const { field, isInvalid, errors } = useFieldErrors();
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Select
        items={items}
        value={(field.state.value as string) || null}
        onValueChange={(value) => field.handleChange(value ?? "")}
      >
        <SelectTrigger
          id={field.name}
          aria-invalid={isInvalid}
          onBlur={field.handleBlur}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError errors={errors} />
    </Field>
  );
}

export function SwitchField({
  label,
  description,
}: {
  label: ReactNode;
  description?: ReactNode;
}) {
  const { field } = useFieldErrors();
  return (
    <Field orientation="horizontal">
      <FieldContent>
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
      <Switch
        id={field.name}
        checked={field.state.value as boolean}
        onCheckedChange={(checked) => field.handleChange(checked)}
      />
    </Field>
  );
}

type PasswordFieldProps = {
  label: ReactNode;
  description?: ReactNode;
  autoComplete: "current-password" | "new-password" | "off";
};

/** Password input with a show/hide toggle; paste and password managers stay allowed. */
export function PasswordField({
  label,
  description,
  autoComplete,
}: PasswordFieldProps) {
  const { field, isInvalid, errors } = useFieldErrors();
  const t = useTranslations("form");
  const [visible, setVisible] = useState(false);
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={field.name}
          name={field.name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={field.state.value as string}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
          aria-invalid={isInvalid}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label={visible ? t("hidePassword") : t("showPassword")}
            aria-pressed={visible}
            onClick={() => setVisible((value) => !value)}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  );
}

export function TextareaField({
  label,
  description,
}: {
  label: ReactNode;
  description?: ReactNode;
}) {
  const { field, isInvalid, errors } = useFieldErrors();
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Textarea
        id={field.name}
        name={field.name}
        rows={4}
        value={field.state.value as string}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        aria-invalid={isInvalid}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  );
}
