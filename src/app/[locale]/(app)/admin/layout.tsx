import { ShieldCheckIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/modules/identity";

async function AdminGate({ children }: { children: React.ReactNode }) {
  const { hasSecondFactor } = await requireAdmin();
  if (hasSecondFactor) return children;

  const t = await getTranslations("admin.secondFactorRequired");
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShieldCheckIcon />
        </EmptyMedia>
        <EmptyTitle>{t("title")}</EmptyTitle>
        <EmptyDescription>{t("description")}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <ol className="list-decimal space-y-1 ps-5 text-left text-sm">
          {(t.raw("steps") as string[]).map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <Button render={<Link href={routes.account} />}>{t("action")}</Button>
      </EmptyContent>
    </Empty>
  );
}

export default function AdminLayout({
  children,
}: LayoutProps<"/[locale]/admin">) {
  return (
    <Suspense>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}
