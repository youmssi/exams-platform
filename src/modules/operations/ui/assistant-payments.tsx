"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { track } from "@/shared/analytics";
import { useTRPC } from "@/trpc/client";
import { PaymentAnswer } from "./payment-answer";

const POLL_MS = 60_000;

/** The assistant's shares still to receive; hidden when there is none. */
export function AssistantPayments() {
  const t = useTranslations("payment");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: payments } = useSuspenseQuery({
    ...trpc.operations.payments.queryOptions(),
    refetchInterval: POLL_MS,
  });
  const answer = useMutation(
    trpc.operations.answerPayment.mutationOptions({
      onSuccess: async (_, { received }) => {
        track({ name: received ? "payment_confirmed" : "payment_rejected" });
        await queryClient.invalidateQueries({
          queryKey: trpc.operations.payments.queryKey(),
        });
        toast.success(received ? t("answer.thanks") : t("answer.sentBack"));
      },
      onError: () => toast.error(tCommon("error")),
    }),
  );
  if (!payments.length) return null;

  return (
    <section className="flex flex-col gap-3" aria-labelledby="payments-title">
      <h2 id="payments-title" className="font-semibold text-lg">
        {t("assistantTitle")}
      </h2>
      <ItemGroup>
        {payments.map((payment) => (
          <Item key={payment.id} variant="outline" className="flex-wrap">
            <ItemContent className="min-w-0">
              <ItemTitle className="flex-wrap">
                {format.number(payment.amount, {
                  style: "currency",
                  currency: payment.currency,
                  maximumFractionDigits: 0,
                })}
                <Badge variant="outline">{payment.reference}</Badge>
                <Badge
                  variant={
                    payment.status === "DECLARED" ? "default" : "secondary"
                  }
                >
                  {t(`assistantStatus.${payment.status}`)}
                </Badge>
              </ItemTitle>
              <ItemDescription>
                {payment.center} · {payment.level} ·{" "}
                {format.dateTime(new Date(payment.examDate), {
                  dateStyle: "medium",
                  timeZone: "UTC",
                })}
              </ItemDescription>
            </ItemContent>
            {payment.status === "DECLARED" && (
              <ItemActions>
                <PaymentAnswer
                  pending={answer.isPending}
                  onAnswer={(received) =>
                    answer.mutate({ id: payment.id, received })
                  }
                />
              </ItemActions>
            )}
          </Item>
        ))}
      </ItemGroup>
    </section>
  );
}
