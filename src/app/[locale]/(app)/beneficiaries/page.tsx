import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Beneficiaries } from "@/modules/beneficiaries";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

async function BeneficiariesData() {
  await connection();
  prefetch(trpc.beneficiaries.list.queryOptions());
  return (
    <HydrateClient>
      <Beneficiaries />
    </HydrateClient>
  );
}

export default function BeneficiariesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <BeneficiariesData />
    </Suspense>
  );
}
