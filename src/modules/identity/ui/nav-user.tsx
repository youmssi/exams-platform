"use client";

import { ChevronsUpDownIcon, LogOutIcon, UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { routes } from "@/config/routes";
import { Link, useRouter } from "@/i18n/navigation";
import { initials } from "@/shared/initials";
import { authClient } from "../auth-client";
import type { Role } from "../schemas";

export type NavUserData = {
  name: string;
  email: string;
  image?: string | null;
  activeRole: Role;
};

function UserSummary({
  user,
  subtitle,
}: {
  user: NavUserData;
  subtitle: string;
}) {
  return (
    <>
      <Avatar>
        {user.image && <AvatarImage src={user.image} alt="" />}
        <AvatarFallback>{initials(user.name)}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{user.name}</span>
        <span className="truncate text-xs">{subtitle}</span>
      </div>
    </>
  );
}

export function NavUser({ user }: { user: NavUserData }) {
  const t = useTranslations("app");
  const { isMobile } = useSidebar();
  const router = useRouter();
  const role = t(`roleLabel.${user.activeRole}`);

  const signOut = async () => {
    await authClient.signOut();
    router.replace(routes.signIn);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <UserSummary user={user} subtitle={role} />
            <ChevronsUpDownIcon className="ml-auto size-4" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-fit"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <UserSummary user={user} subtitle={user.email} />
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href={routes.account} />}>
                <UserIcon />
                {t("nav.account")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <LogOutIcon />
              {t("signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
