import "server-only";
import { isFullExam } from "@/modules/catalog";
import { presenceKey } from "@/modules/realtime";
import { db } from "@/server/db";
import { compareQueue } from "../domain/queue";

/**
 * Published, open requests of upcoming sessions, anonymised: no name, no contact,
 * only what an assistant needs to decide. Never the assistant's own requests.
 */
export async function listQueue(assistantId: string) {
  const now = new Date();
  const requests = await db.request.findMany({
    where: {
      status: "OPEN",
      publishAt: { lte: now },
      ownerId: { not: assistantId },
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
  return requests.sort(compareQueue).map(({ ownerId, ...request }) => ({
    ...request,
    candidateKey: presenceKey(ownerId),
    isFullExam: isFullExam(request.session.offer.modules, request.modules),
  }));
}
