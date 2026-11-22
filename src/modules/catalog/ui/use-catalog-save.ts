"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";

/** Shared outcome of every catalog save: refresh the list, report, close the form. */
export function useCatalogSaveHandlers(onSaved: () => void) {
  const t = useTranslations("admin.catalog");
  const tCommon = useTranslations("common");
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return {
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: trpc.catalog.adminList.queryKey(),
      });
      toast.success(t("saved"));
      onSaved();
    },
    onError: (error: { message: string }) => {
      toast.error(
        error.message === "duplicate" ? t("duplicate") : tCommon("error"),
      );
    },
  };
}
