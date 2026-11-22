import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CatalogAdmin } from "@/modules/catalog";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

async function Catalog() {
  await connection();
  prefetch(trpc.catalog.adminList.queryOptions());
  return (
    <HydrateClient>
      <CatalogAdmin />
    </HydrateClient>
  );
}

export default function AdminCatalogPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <Catalog />
    </Suspense>
  );
}
