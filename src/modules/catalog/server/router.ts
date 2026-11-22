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
  sessionInput,
} from "../schemas";
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
});
