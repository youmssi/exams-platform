import "server-only";
import { NextResponse } from "next/server";
import { auth } from "@/modules/identity";
import { recordAudit } from "@/server/audit";
import { db } from "@/server/db";
import { exportUserData } from "./users";

/** Downloads a user's data as JSON, for an admin with a second-factor session. Audited. */
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (session?.user.role !== "admin" || !session.session.secondFactorAt)
    return new NextResponse(null, { status: 404 });
  const userId = new URL(request.url).searchParams.get("userId") ?? "";
  const data = await exportUserData(userId).catch(() => null);
  if (!data) return new NextResponse(null, { status: 404 });
  await db.$transaction((tx) =>
    recordAudit(tx, {
      actorId: session.user.id,
      action: "user.export",
      targetType: "user",
      targetId: userId,
    }),
  );
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="exams-${userId}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
