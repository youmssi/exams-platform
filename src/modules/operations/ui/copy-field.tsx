"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";

/** A read-only value copied in one tap. */
export function CopyField({
  id,
  label,
  value,
  children,
}: {
  id: string;
  label: string;
  value: string;
  /** Extra buttons, e.g. show the password. */
  children?: React.ReactNode;
}) {
  const t = useTranslations("operation");
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(t("copied"));
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <InputGroup>
        <InputGroupInput id={id} value={value} readOnly />
        <InputGroupAddon align="inline-end">
          {children}
          <InputGroupButton
            size="icon-xs"
            aria-label={t("copy", { label })}
            onClick={copy}
            disabled={!value}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
