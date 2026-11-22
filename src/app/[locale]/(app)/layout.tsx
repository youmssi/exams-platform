import { Suspense } from "react";
import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { requireOnboardedUser } from "@/modules/identity";

async function Shell({ children }: { children: React.ReactNode }) {
  const user = await requireOnboardedUser();
  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          name: user.name,
          email: user.email,
          image: user.image,
          activeRole: user.activeRole,
        }}
      />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
        </header>
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AppLayout({ children }: LayoutProps<"/[locale]">) {
  return (
    <Suspense fallback={<Skeleton className="m-4 h-[calc(100svh-2rem)]" />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
