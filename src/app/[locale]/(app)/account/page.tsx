import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AssistantProfileCard } from "@/modules/assistants";
import { SelfProfileCard } from "@/modules/beneficiaries";
import { AccountSettings, requireOnboardedUser } from "@/modules/identity";
import { StandingCard } from "@/modules/trust";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

async function Account() {
  await connection();
  const user = await requireOnboardedUser();
  prefetch(trpc.beneficiaries.list.queryOptions());
  prefetch(trpc.assistants.profile.queryOptions());
  prefetch(trpc.trust.standing.queryOptions());
  return (
    <HydrateClient>
      <AccountSettings
        profiles={
          <>
            <SelfProfileCard />
            <AssistantProfileCard />
            <StandingCard />
          </>
        }
        admin={
          user.role === "admin"
            ? { twoFactorEnabled: Boolean(user.twoFactorEnabled) }
            : undefined
        }
      />
    </HydrateClient>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <Account />
    </Suspense>
  );
}
