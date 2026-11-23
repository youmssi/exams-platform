"use client";

import {
  CalendarDaysIcon,
  LibraryIcon,
  ListChecksIcon,
  RadioTowerIcon,
  UsersIcon,
} from "lucide-react";
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

/** Each role sees only its own work. */
const NAV = {
  candidate: [
    { href: routes.sessions, key: "sessions", Icon: CalendarDaysIcon },
    { href: routes.requests, key: "requests", Icon: ListChecksIcon },
    { href: routes.beneficiaries, key: "beneficiaries", Icon: UsersIcon },
  ],
  assistant: [{ href: routes.queue, key: "queue", Icon: RadioTowerIcon }],
} as const;
const ADMIN_NAV = [
  { href: routes.adminCatalog, key: "catalog", Icon: LibraryIcon },
] as const;

type NavEntry =
  | (typeof NAV)[keyof typeof NAV][number]
  | (typeof ADMIN_NAV)[number];

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
          <NavMenu
            entries={NAV[user.activeRole]}
            pathname={pathname}
            label={t}
          />
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
