import { Suspense } from "react";
import { AccountSettings, requireOnboardedUser } from "@/modules/identity";

async function Account() {
  const user = await requireOnboardedUser();
  return <AccountSettings activeRole={user.activeRole} />;
}

export default function AccountPage() {
  return (
    <Suspense>
      <Account />
    </Suspense>
  );
}
