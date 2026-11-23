"use client";

import { useTranslations } from "next-intl";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import {
  DISPUTE_STEPS,
  type DisputeStatus,
  disputeStep,
} from "../domain/dispute";

/** Named steps of a dispute, read without colour: "Step 2 of 4: proof requested". */
export function DisputeSteps({ status }: { status: DisputeStatus }) {
  const t = useTranslations("dispute");
  const step = disputeStep(status);
  return (
    <Progress value={(step / DISPUTE_STEPS.length) * 100}>
      <ProgressLabel>
        {t("step", {
          step,
          total: DISPUTE_STEPS.length,
          name: t(`steps.${status}`),
        })}
      </ProgressLabel>
    </Progress>
  );
}
