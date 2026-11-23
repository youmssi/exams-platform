"use client";

import { useMutation } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { toast } from "sonner";
import { CopyField } from "@/components/copy-field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { track } from "@/shared/analytics";
import { useTRPC } from "@/trpc/client";
import type { MyRequest } from "./types";

type Operation = NonNullable<MyRequest["operation"]>;
type Payment = Operation["payments"][number];

const BADGE = {
  DUE: "outline",
  DECLARED: "secondary",
  RECEIVED: "default",
} as const;

/**
 * Settlement of a confirmed booking: two deposits, each with its amount, account and reference,
 * stacked on a phone. Once both are received, a short summary replaces them.
 */
export function PaymentPanel({
  operation,
  timeZone,
  refresh,
}: {
  operation: Operation;
  timeZone: string;
  refresh: () => void;
}) {
  const t = useTranslations("payment");
  const format = useFormatter();
  const date = (value: Date | string) =>
    format.dateTime(new Date(value), "zoned", { timeZone });

  if (operation.status === "CLOSED" && operation.closedAt) {
    return (
      <Alert>
        <AlertTitle>
          {t("closed.title", { date: date(operation.closedAt) })}
        </AlertTitle>
        <AlertDescription>{t("closed.description")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {operation.status === "UNPAID" ? (
        <Alert variant="destructive">
          <AlertTitle>{t("unpaid.title")}</AlertTitle>
          <AlertDescription>{t("unpaid.description")}</AlertDescription>
        </Alert>
      ) : (
        operation.paymentDueAt && (
          <p className="text-muted-foreground text-sm">
            {t("deadline", { date: date(operation.paymentDueAt) })}
          </p>
        )
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {operation.payments.map((payment) => (
          <PaymentCard
            key={payment.id}
            payment={payment}
            reference={operation.reference}
            refresh={refresh}
          />
        ))}
      </div>
    </div>
  );
}

function PaymentCard({
  payment,
  reference,
  refresh,
}: {
  payment: Payment;
  reference: string;
  refresh: () => void;
}) {
  const t = useTranslations("payment");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const trpc = useTRPC();
  const declare = useMutation(
    trpc.operations.declarePayment.mutationOptions({
      onSuccess: async () => {
        track({ name: "payment_declared" });
        await refresh();
        toast.success(t("declared"));
      },
      onError: () => toast.error(tCommon("error")),
    }),
  );
  const { account } = payment;
  const id = `payment-${payment.id}`;

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t(`recipient.${payment.recipient}`)}</CardTitle>
        <CardDescription className="font-semibold text-foreground text-xl">
          {format.number(payment.amount, {
            style: "currency",
            currency: payment.currency,
            maximumFractionDigits: 0,
          })}
        </CardDescription>
        <CardAction>
          <Badge variant={BADGE[payment.status]}>
            {t(`status.${payment.status}`)}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {account ? (
          <>
            <CopyField
              id={`${id}-number`}
              label={account.operator}
              value={account.number}
            />
            <p className="text-muted-foreground text-sm">
              {t("holder", { name: account.name })}
            </p>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">{t("noAccount")}</p>
        )}
        <CopyField
          id={`${id}-reference`}
          label={t("reference")}
          value={reference}
        />
        {payment.status === "DUE" && payment.rejections > 0 && (
          <Alert variant="destructive">
            <AlertTitle>{t("rejected.title")}</AlertTitle>
            <AlertDescription>{t("rejected.description")}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      {payment.status === "DUE" && (
        <CardFooter>
          <Button
            className="w-full"
            disabled={!account || declare.isPending}
            onClick={() => declare.mutate({ id: payment.id })}
          >
            {t("declare")}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
