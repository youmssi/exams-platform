import { NextResponse } from "next/server";
import { proposeSessionDates } from "@/modules/catalog";
import { sweepUnbooked } from "@/modules/requests";
import { env } from "@/server/env";

export const maxDuration = 60;

/**
 * Daily job (Vercel Cron): proposes the dates found on centres' pages (EXM-023), then marks passed
 * requests unbooked and carries them over (EXM-022) for accounts nobody opened lately.
 * Only Vercel's scheduler, holding `CRON_SECRET`, may run it.
 */
export async function GET(request: Request) {
  if (
    !env.CRON_SECRET ||
    request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`
  )
    return new NextResponse(null, { status: 401 });
  await proposeSessionDates();
  await sweepUnbooked();
  return NextResponse.json({ ok: true });
}
