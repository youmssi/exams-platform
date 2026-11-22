import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "@/trpc/init";
import { centerInput, countryInput, offerInput } from "../schemas";
import { listCatalog, saveCenter, saveCountry, saveOffer } from "./service";

const optionalId = z.object({ id: z.string().min(1).optional() });

export const catalogRouter = createTRPCRouter({
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
