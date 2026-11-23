import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ConsentAnswer } from "@/modules/beneficiaries";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

async function Consent({ searchParams }: PageProps<"/[locale]/consent">) {
  await connection();
  const { token } = await searchParams;
  const value = typeof token === "string" ? token : "";
  if (value)
    prefetch(trpc.beneficiaries.consentInfo.queryOptions({ token: value }));
  return (
    <HydrateClient>
      <ConsentAnswer token={value} />
    </HydrateClient>
  );
}

/** Public: a friend confirms or refuses from the emailed link, without an account. */
export default function ConsentPage(props: PageProps<"/[locale]/consent">) {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <Consent {...props} />
    </Suspense>
  );
}
