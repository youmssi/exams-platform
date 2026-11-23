import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import {
  catalogRequestInput,
  centerInput,
  countryInput,
  offerInput,
  proposalSessionInput,
  sessionInput,
} from "../schemas";
import {
  createFromProposal,
  dismissProposal,
  listSessionReview,
  verifySession,
} from "./dates";
import { listCatalog, saveCenter, saveCountry, saveOffer } from "./service";
import {
  confirmSession,
  createSession,
  listOffers,
  listUpcomingSessions,
  requestCatalogAddition,
} from "./sessions";

const optionalId = z.object({ id: z.string().min(1).optional() });

export const catalogRouter = createTRPCRouter({
  offers: protectedProcedure.query(() => listOffers()),
  sessions: protectedProcedure.query(({ ctx }) =>
    listUpcomingSessions(ctx.session.user.id),
  ),
  createSession: protectedProcedure
    .input(sessionInput)
    .mutation(({ ctx, input }) => createSession(ctx.session.user.id, input)),
  confirmSession: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(({ ctx, input }) =>
      confirmSession(ctx.session.user.id, input.id),
    ),
  requestAddition: protectedProcedure
    .input(catalogRequestInput)
    .mutation(({ ctx, input }) =>
      requestCatalogAddition(ctx.session.user.id, input),
    ),
  adminList: adminProcedure.query(() => listCatalog()),
  saveCountry: adminProcedure
    .input(optionalId.extend({ data: countryInput }))
    .mutation(({ ctx, input }) =>
      saveCountry(ctx.session.user.id, input.data, input.id),
    ),
  saveCenter: adminProcedure
    .input(optionalId.extend({ data: centerInput }))
    .mutation(({ ctx, input }) =>
      saveCenter(ctx.session.user.id, input.data, input.id),
    ),
  saveOffer: adminProcedure
    .input(optionalId.extend({ data: offerInput }))
    .mutation(({ ctx, input }) =>
      saveOffer(ctx.session.user.id, input.data, input.id),
    ),
  /** Detected dates, sessions to validate and centres whose dates page failed. */
  sessionReview: adminProcedure.query(() => listSessionReview()),
  createFromProposal: adminProcedure
    .input(proposalSessionInput)
    .mutation(({ ctx, input }) =>
      createFromProposal(ctx.session.user.id, input.id, input),
    ),
  dismissProposal: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(({ input }) => dismissProposal(input.id)),
  verifySession: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(({ ctx, input }) => verifySession(ctx.session.user.id, input.id)),
});
