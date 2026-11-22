"use client";

import { HomeIcon, LibraryIcon, UsersIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { LogoMark } from "@/components/brand/logo";
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

const NAV = [
  { href: routes.home, key: "home", Icon: HomeIcon },
  { href: routes.beneficiaries, key: "beneficiaries", Icon: UsersIcon },
] as const;
const ADMIN_NAV = [
  { href: routes.adminCatalog, key: "catalog", Icon: LibraryIcon },
] as const;

type NavEntry = (typeof NAV)[number] | (typeof ADMIN_NAV)[number];

export function AppSidebar({
  user,
  isAdmin,
}: {
  user: NavUserData;
  isAdmin: boolean;
}) {
  const t = useTranslations("app.nav");
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href={routes.home} />}>
              <LogoMark />
              <span className="font-semibold">Exams</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("main")}</SidebarGroupLabel>
          <NavMenu entries={NAV} pathname={pathname} label={t} />
        </SidebarGroup>
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>{t("admin")}</SidebarGroupLabel>
            <NavMenu entries={ADMIN_NAV} pathname={pathname} label={t} />
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function NavMenu({
  entries,
  pathname,
  label,
}: {
  entries: readonly NavEntry[];
  pathname: string;
  label: (key: NavEntry["key"]) => string;
}) {
  return (
    <SidebarMenu>
      {entries.map(({ href, key, Icon }) => (
        <SidebarMenuItem key={key}>
          <SidebarMenuButton
            isActive={pathname === href}
            tooltip={label(key)}
            render={<Link href={href} />}
          >
            <Icon />
            <span>{label(key)}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
