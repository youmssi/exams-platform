"use client";

import { HomeIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { routes } from "@/config/routes";
import { Link, usePathname } from "@/i18n/navigation";
import { NavUser, type NavUserData } from "@/modules/identity/client";

const NAV = [{ href: routes.home, key: "home", Icon: HomeIcon }] as const;

export function AppSidebar({ user }: { user: NavUserData }) {
  const t = useTranslations("app.nav");
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href={routes.home} />}>
              <span className="flex size-8 items-center justify-center rounded-md bg-primary font-bold text-primary-foreground">
                E
              </span>
              <span className="font-semibold">Exams</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("main")}</SidebarGroupLabel>
          <SidebarMenu>
            {NAV.map(({ href, key, Icon }) => (
              <SidebarMenuItem key={key}>
                <SidebarMenuButton
                  isActive={pathname === href}
                  tooltip={t(key)}
                  render={<Link href={href} />}
                >
                  <Icon />
                  <span>{t(key)}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
