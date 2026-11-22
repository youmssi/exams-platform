"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useFormContext } from "./context";

export function SubmitButton({
  children,
  ...props
}: ComponentProps<typeof Button>) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          {...props}
        >
          {isSubmitting && <Spinner />}
          {children}
        </Button>
      )}
    </form.Subscribe>
  );
}
