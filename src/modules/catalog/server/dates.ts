import "server-only";
import { TRPCError } from "@trpc/server";
import { recordAudit } from "@/server/audit";
import { db } from "@/server/db";
import { extractExamDates, pageText } from "../domain/dates";
import { type SessionInput, sessionInput } from "../schemas";
import { createSession } from "./sessions";

const FETCH_TIMEOUT_MS = 15_000;
const today = () => new Date().toISOString().slice(0, 10);

/** Reads one centre's dates page; returns the dates found per offer, or throws a short reason. */
async function readDates(url: string, offers: { id: string; level: string }[]) {
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; ExamDatesReader/1.0)" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const text = pageText(await response.text());
  const found = offers.map((offer) => ({
    offerId: offer.id,
    dates: extractExamDates(text, offer.level, today()),
  }));
  // A page that used to list dates and now lists none has most likely changed its format.
  if (found.every(({ dates }) => dates.length === 0))
    throw new Error("noDates");
  return found;
}

/**
 * Daily job: for each centre an admin enabled, proposes the dates found on its official page.
 * Dates already proposed or already sessions are skipped; a failure is recorded on the centre
 * and stops nothing else.
 */
export async function proposeSessionDates() {
  const centers = await db.center.findMany({
    where: { active: true, autoDates: true, datesUrl: { not: null } },
    select: {
      id: true,
      datesUrl: true,
      offers: { where: { active: true }, select: { id: true, level: true } },
    },
  });
  for (const center of centers) {
    const url = center.datesUrl as string;
    try {
      const found = await readDates(url, center.offers);
      for (const { offerId, dates } of found) {
        const existing = await db.examSession.findMany({
          where: {
            offerId,
            examDate: { in: dates.map((d) => new Date(`${d}T00:00:00Z`)) },
          },
          select: { examDate: true },
        });
        const known = new Set(
          existing.map((s) => s.examDate.toISOString().slice(0, 10)),
        );
        await db.dateProposal.createMany({
          data: dates
            .filter((date) => !known.has(date))
            .map((date) => ({
              offerId,
              examDate: new Date(`${date}T00:00:00Z`),
              sourceUrl: url,
            })),
          skipDuplicates: true,
        });
      }
      await db.center.update({
        where: { id: center.id },
        data: { datesCheckedAt: new Date(), datesError: null },
      });
    } catch (error) {
      await db.center.update({
        where: { id: center.id },
        data: {
          datesCheckedAt: new Date(),
          datesError:
            error instanceof Error ? error.message.slice(0, 200) : "error",
        },
      });
    }
  }
}

/** What the admin reviews: detected dates, sessions waiting for validation, centres in error. */
export async function listSessionReview() {
  const [proposals, unverified, failing] = await Promise.all([
    db.dateProposal.findMany({
      where: { handledAt: null, examDate: { gte: new Date(today()) } },
      orderBy: { examDate: "asc" },
      select: {
        id: true,
        examDate: true,
        sourceUrl: true,
        offer: {
          select: {
            level: true,
            center: {
              select: { name: true, country: { select: { timeZone: true } } },
            },
          },
        },
      },
    }),
    db.examSession.findMany({
      where: { verifiedAt: null, examDate: { gte: new Date(today()) } },
      orderBy: { examDate: "asc" },
      select: {
        id: true,
        examDate: true,
        registrationOpensAt: true,
        officialUrl: true,
        _count: { select: { confirmations: true } },
        offer: { select: { level: true, center: { select: { name: true } } } },
      },
    }),
    db.center.findMany({
      where: { autoDates: true, datesError: { not: null } },
      select: { id: true, name: true, datesError: true, datesCheckedAt: true },
    }),
  ]);
  return { proposals, unverified, failing };
}

/** The admin turns a detected date into a confirmed session, giving the opening time. */
export async function createFromProposal(
  adminId: string,
  proposalId: string,
  input: Pick<SessionInput, "registrationOpensAt" | "officialUrl">,
) {
  const proposal = await db.dateProposal.findFirst({
    where: { id: proposalId, handledAt: null },
    select: { offerId: true, examDate: true },
  });
  if (!proposal) throw new TRPCError({ code: "NOT_FOUND" });
  const session = sessionInput.safeParse({
    offerId: proposal.offerId,
    examDate: proposal.examDate.toISOString().slice(0, 10),
    ...input,
  });
  if (!session.success)
    throw new TRPCError({ code: "BAD_REQUEST", message: "opensAfterExam" });
  const created = await createSession(adminId, session.data, true);
  await db.dateProposal.update({
    where: { id: proposalId },
    data: { handledAt: new Date() },
  });
  return created;
}

export async function dismissProposal(proposalId: string) {
  const { count } = await db.dateProposal.updateMany({
    where: { id: proposalId, handledAt: null },
    data: { handledAt: new Date() },
  });
  if (!count) throw new TRPCError({ code: "NOT_FOUND" });
}

/** An admin vouches for a session added by a user. */
export async function verifySession(adminId: string, sessionId: string) {
  await db.$transaction(async (tx) => {
    const { count } = await tx.examSession.updateMany({
      where: { id: sessionId, verifiedAt: null },
      data: { verifiedAt: new Date() },
    });
    if (!count) throw new TRPCError({ code: "NOT_FOUND" });
    await recordAudit(tx, {
      actorId: adminId,
      action: "session.verify",
      targetType: "session",
      targetId: sessionId,
    });
  });
}
