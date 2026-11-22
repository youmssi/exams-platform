import "server-only";
import { isAssistantReady } from "@/modules/assistants";
import { isFullExam } from "@/modules/catalog";
import { activeOperation } from "@/modules/operations";
import { presenceKey } from "@/modules/realtime";
import { db } from "@/server/db";
import { compareQueue } from "../domain/queue";

/**
 * Published, open requests of upcoming sessions that nobody is working on, anonymised:
 * no name, no contact, only what an assistant needs to decide. Never the assistant's own requests.
 * An assistant with a running operation gets no requests: one client at a time.
 */
export async function listQueue(assistantId: string) {
  const now = new Date();
  const [ready, busy] = await Promise.all([
    isAssistantReady(assistantId),
    db.operation.count({ where: { assistantId, ...activeOperation(now) } }),
  ]);
  if (!ready) return { state: "profileIncomplete" as const, requests: [] };
  if (busy) return { state: "busy" as const, requests: [] };
  const requests = await db.request.findMany({
    where: {
      status: "OPEN",
      publishAt: { lte: now },
      ownerId: { not: assistantId },
      operations: { none: activeOperation(now) },
      session: {
        examDate: { gte: new Date(now.toISOString().slice(0, 10)) },
        offer: { active: true },
      },
    },
    select: {
      id: true,
      ownerId: true,
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
    requests: requests.sort(compareQueue).map(({ ownerId, ...request }) => ({
      ...request,
      candidateKey: presenceKey(ownerId),
      isFullExam: isFullExam(request.session.offer.modules, request.modules),
    })),
  };
}
