import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getImovelProximos,
  getImovelPorStatus,
  getImovelPorId,
  getImovelRecentes,
  incrementarVisualizacoes,
} from "./db";
import { adminRouter } from "./routers/admin";
import { mediaRouter } from "./routers/media";
import { notificationsRouter } from "./routers/notifications";
import { analyticsRouter } from "./routers/analytics";
import { favoritesRouter } from "./routers/favorites";
import { reviewsRouter } from "./routers/reviews";
import { messagingRouter } from "./routers/messaging";
import { searchRouter } from "./routers/search";
import { seoRouter } from "./routers/seo";

export const appRouter = router({
  system: systemRouter,
  admin: adminRouter,
  media: mediaRouter,
  notifications: notificationsRouter,
  analytics: analyticsRouter,
  favorites: favoritesRouter,
  reviews: reviewsRouter,
  messaging: messagingRouter,
  search: searchRouter,
  seo: seoRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  /**
   * Router para funcionalidades de imóveis
   */
  imoveis: router({
    /**
     * Buscar imóveis próximos por geolocalização
     */
    proximosDe: publicProcedure
      .input(
        z.object({
          latitude: z.number(),
          longitude: z.number(),
          raioKm: z.number().optional().default(10),
        })
      )
      .query(async ({ input }) => {
        const imoveis = await getImovelProximos(
          input.latitude,
          input.longitude,
          input.raioKm
        );
        return imoveis;
      }),

    /**
     * Buscar imóveis por status
     */
    porStatus: publicProcedure
      .input(
        z.object({
          status: z.enum(["disponivel", "alugado", "promocao", "imperdivel"]),
          limite: z.number().optional().default(10),
        })
      )
      .query(async ({ input }) => {
        const imoveis = await getImovelPorStatus(input.status, input.limite);
        return imoveis;
      }),

    /**
     * Buscar imóvel por ID
     */
    porId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const imovel = await getImovelPorId(input.id);
        if (imovel) {
          // Incrementar visualizações
          await incrementarVisualizacoes(input.id);
        }
        return imovel;
      }),

    /**
     * Buscar imóveis mais recentes
     */
    recentes: publicProcedure
      .input(z.object({ limite: z.number().optional().default(10) }))
      .query(async ({ input }) => {
        const imoveis = await getImovelRecentes(input.limite);
        return imoveis;
      }),

    /**
     * Buscar promoções
     */
    promocoes: publicProcedure
      .input(z.object({ limite: z.number().optional().default(3) }))
      .query(async ({ input }) => {
        const imoveis = await getImovelPorStatus("promocao", input.limite);
        return imoveis;
      }),

    /**
     * Buscar ofertas imperdíveis
     */
    ofertasImpediveis: publicProcedure
      .input(z.object({ limite: z.number().optional().default(3) }))
      .query(async ({ input }) => {
        const imoveis = await getImovelPorStatus("imperdivel", input.limite);
        return imoveis;
      }),

    /**
     * Buscar aluguéis normais (disponíveis)
     */
    alugueisNormais: publicProcedure
      .input(z.object({ limite: z.number().optional().default(3) }))
      .query(async ({ input }) => {
        const imoveis = await getImovelPorStatus("disponivel", input.limite);
        return imoveis;
      }),
  }),
});

export type AppRouter = typeof appRouter;
