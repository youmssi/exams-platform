"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { initials } from "@/shared/initials";
import { useTRPC } from "@/trpc/client";
import { canAddBeneficiary, MAX_BENEFICIARIES } from "../domain/limits";
import { BeneficiaryForm } from "./beneficiary-form";
import type { Beneficiary } from "./types";

type Editing = { beneficiary?: Beneficiary } | null;

export function Beneficiaries() {
  const t = useTranslations("beneficiaries");
  const trpc = useTRPC();
  const { data: beneficiaries } = useSuspenseQuery(
    trpc.beneficiaries.list.queryOptions(),
  );
  const [editing, setEditing] = useState<Editing>(null);
  const canAdd = canAddBeneficiary(beneficiaries.length);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-2xl">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("subtitle", { max: MAX_BENEFICIARIES })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button disabled={!canAdd} onClick={() => setEditing({})}>
            <PlusIcon />
            {t("add")}
          </Button>
          {!canAdd && (
            <output className="text-muted-foreground text-sm">
              {t("limitReached")}
            </output>
          )}
        </div>
      </div>

      <ItemGroup>
        {beneficiaries.map((beneficiary) => (
          <BeneficiaryItem
            key={beneficiary.id}
            beneficiary={beneficiary}
            onEdit={() => setEditing({ beneficiary })}
          />
        ))}
      </ItemGroup>

      <ResponsiveDialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        title={
          editing?.beneficiary
            ? t("editTitle", { name: editing.beneficiary.fullName })
            : t("addTitle")
        }
        description={editing?.beneficiary ? undefined : t("addDescription")}
      >
        {editing && (
          <BeneficiaryForm
            beneficiary={editing.beneficiary}
            onSaved={() => setEditing(null)}
          />
        )}
      </ResponsiveDialog>
    </div>
  );
}

function BeneficiaryItem({
  beneficiary,
  onEdit,
}: {
  beneficiary: Beneficiary;
  onEdit: () => void;
}) {
  const t = useTranslations("beneficiaries");
  const tCommon = useTranslations("common");
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const remove = useMutation(
    trpc.beneficiaries.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.beneficiaries.list.queryKey(),
        });
        toast.success(t("removed", { name: beneficiary.fullName }));
      },
      onError: (error) =>
        toast.error(
          error.message === "hasOpenRequest"
            ? t("hasOpenRequest")
            : tCommon("error"),
        ),
    }),
  );

  return (
    <Item variant="outline">
      <ItemMedia>
        <Avatar>
          <AvatarFallback>
            {initials(beneficiary.fullName || beneficiary.email)}
          </AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent className="min-w-0">
        <ItemTitle className="flex-wrap">
          <span className="truncate">
            {beneficiary.fullName || t("noName")}
          </span>
          {beneficiary.isSelf && <Badge variant="secondary">{t("self")}</Badge>}
        </ItemTitle>
        <ItemDescription className="truncate">
          {beneficiary.email}
        </ItemDescription>
        <div>
          <Badge variant={beneficiary.hasPassword ? "outline" : "destructive"}>
            {beneficiary.hasPassword
              ? t("status.ready")
              : t("status.missingPassword")}
          </Badge>
        </div>
      </ItemContent>
      <ItemActions>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("editTitle", { name: beneficiary.fullName })}
          onClick={onEdit}
        >
          <PencilIcon />
        </Button>
        {!beneficiary.isSelf && (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("removeTitle", { name: beneficiary.fullName })}
                />
              }
            >
              <Trash2Icon />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("removeTitle", { name: beneficiary.fullName })}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("removeBody")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => remove.mutate({ id: beneficiary.id })}
                >
                  {t("remove")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </ItemActions>
    </Item>
  );
}
