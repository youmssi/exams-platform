"use client";

import { useTranslations } from "next-intl";
import { ConfirmAction } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";

/** Received / not received for a declared deposit; "not received" asks for confirmation first. */
export function PaymentAnswer({
  pending,
  onAnswer,
}: {
  pending: boolean;
  onAnswer: (received: boolean) => void;
}) {
  const t = useTranslations("payment.answer");
  return (
    <>
      <Button size="sm" disabled={pending} onClick={() => onAnswer(true)}>
        {t("received")}
      </Button>
      <ConfirmAction
        trigger={<Button size="sm" variant="outline" disabled={pending} />}
        title={t("notReceivedTitle")}
        description={t("notReceivedBody")}
        confirm={t("notReceived")}
        cancel={t("keep")}
        destructive
        onConfirm={() => onAnswer(false)}
      >
        {t("notReceived")}
      </ConfirmAction>
    </>
  );
}
