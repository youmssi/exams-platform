import { Suspense } from "react";
import { AccountSettings, requireOnboardedUser } from "@/modules/identity";

async function Account() {
  const user = await requireOnboardedUser();
  return (
    <AccountSettings
      activeRole={user.activeRole}
      admin={
        user.role === "admin"
          ? { twoFactorEnabled: Boolean(user.twoFactorEnabled) }
          : undefined
      }
    />
  );
}

export default function AccountPage() {
  return (
    <Suspense>
      <Account />
    </Suspense>
  );
}
