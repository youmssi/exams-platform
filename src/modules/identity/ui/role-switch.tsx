"use client";

import { useMutation } from "@tanstack/react-query";
import { BriefcaseIcon, UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { routes } from "@/config/routes";
import { useRouter } from "@/i18n/navigation";
import { useTRPC } from "@/trpc/client";
import type { Role } from "../schemas";

const ICONS = { candidate: UserIcon, assistant: BriefcaseIcon } as const;

/**
 * One account, two roles: always visible, one tap to switch.
 * Each role has its own menu and home; the server checks the active role on every action.
 */
export function RoleSwitch({ activeRole }: { activeRole: Role }) {
  const t = useTranslations("app.roleSwitch");
  const tCommon = useTranslations("common");
  const trpc = useTRPC();
  const router = useRouter();
  const [role, setRole] = useState(activeRole);
  const save = useMutation(
    trpc.identity.setActiveRole.mutationOptions({
      onSuccess: () => {
        router.push(routes.home);
        router.refresh();
      },
      onError: () => {
        setRole(activeRole);
        toast.error(tCommon("error"));
      },
    }),
  );

  return (
    <ToggleGroup
      aria-label={t("label")}
      variant="outline"
      size="sm"
      value={[role]}
      disabled={save.isPending}
      onValueChange={([next]) => {
        if (!next || next === role) return;
        setRole(next as Role);
        save.mutate({ role: next as Role });
      }}
    >
      {(Object.keys(ICONS) as Role[]).map((value) => {
        const Icon = ICONS[value];
        return (
          <ToggleGroupItem key={value} value={value}>
            <Icon />
            {t(value)}
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
