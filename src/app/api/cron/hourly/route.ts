import { NextResponse } from "next/server";
import { sendPaymentReminders } from "@/modules/operations";
import { isCronRequest } from "@/server/cron";

/**
 * Hourly job, called by GitHub Actions (`.github/workflows/hourly.yml`) since Vercel Hobby only
 * schedules daily jobs: payment reminders at H+1 and H+12 (EXM-026).
 */
export async function GET(request: Request) {
  if (!isCronRequest(request)) return new NextResponse(null, { status: 401 });
  const reminders = await sendPaymentReminders();
  return NextResponse.json({ reminders });
}
