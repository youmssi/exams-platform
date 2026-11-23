import "server-only";
import { isAssistantReady } from "@/modules/assistants";
import { isFullExam } from "@/modules/catalog";
import {
  activeOperation,
  assistantBusy,
  claimBlocker,
  lapseOverdue,
  unpaidRequest,
} from "@/modules/operations";
import { presenceKey } from "@/modules/realtime";
import { db } from "@/server/db";
import { compareQueue } from "../domain/queue";

/**
 * Published, open requests of upcoming sessions that nobody is working on, anonymised:
 * no name, no contact, only what an assistant needs to decide. Never the assistant's own requests.
 * An assistant with a running operation gets no requests: one client at a time. Requests of
 * blacklisted accounts stay visible, marked, and cannot be taken.
 */
export async function listQueue(assistantId: string) {
  const now = new Date();
  await lapseOverdue(db);
  const [ready, busy, blocker] = await Promise.all([
    isAssistantReady(assistantId),
    db.operation.count({ where: { assistantId, ...assistantBusy(now) } }),
    claimBlocker(assistantId),
  ]);
  if (!ready)
    return { state: "profileIncomplete" as const, blocker, requests: [] };
  if (busy) return { state: "busy" as const, blocker, requests: [] };
  const requests = await db.request.findMany({
    where: {
      status: "OPEN",
      publishAt: { lte: now },
      ownerId: { not: assistantId },
      issue: null,
      operations: { none: activeOperation(now) },
      session: {
        examDate: { gte: new Date(now.toISOString().slice(0, 10)) },
        offer: { active: true },
      },
    },
    select: {
      id: true,
      ownerId: true,
      owner: {
        select: {
          requests: {
            where: unpaidRequest,
            take: 1,
            select: { id: true },
          },
        },
      },
      publishAt: true,
      modules: true,
      currency: true,
      bonus: true,
      assistantShare: true,
      session: {
        select: {
          id: true,
          examDate: true,
          offer: {
            select: {
              level: true,
              modules: true,
              center: { select: { name: true, city: true } },
            },
          },
        },
      },
    },
  });
  return {
    state: "open" as const,
    blocker,
    requests: requests
      .sort(compareQueue)
      .map(({ ownerId, owner, ...request }) => ({
        ...request,
        blacklisted: owner.requests.length > 0,
        candidateKey: presenceKey(ownerId),
        isFullExam: isFullExam(request.session.offer.modules, request.modules),
      })),
  };
}
