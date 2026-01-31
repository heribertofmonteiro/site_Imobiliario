import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { eq, and, desc } from "drizzle-orm";
import { imoveis, favoritos, historicoAcesso } from "../../drizzle/schema";

/**
 * Router para gerenciar favoritos e histórico de busca
 */
export const favoritesRouter = router({
  /**
   * Adicionar imóvel aos favoritos
   */
  adicionarFavorito: protectedProcedure
    .input(z.object({ imovelId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Verificar se já existe
        const existe = await db
          .select()
          .from(favoritos)
          .where(
            and(
              eq(favoritos.userId, ctx.user!.id),
              eq(favoritos.imovelId, input.imovelId)
            )
          )
          .limit(1);

        if (existe.length > 0) {
          throw new Error("Este imóvel já está nos favoritos");
        }

        // Adicionar favorito
        await db.insert(favoritos).values({
          userId: ctx.user!.id,
          imovelId: input.imovelId,
          createdAt: new Date(),
        });

        return { success: true, message: "Adicionado aos favoritos" };
      } catch (error) {
        console.error("[Favorites] Erro ao adicionar favorito:", error);
        throw error;
      }
    }),

  /**
   * Remover imóvel dos favoritos
   */
  removerFavorito: protectedProcedure
    .input(z.object({ imovelId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await db
          .delete(favoritos)
          .where(
            and(
              eq(favoritos.userId, ctx.user!.id),
              eq(favoritos.imovelId, input.imovelId)
            )
          );

        return { success: true, message: "Removido dos favoritos" };
      } catch (error) {
        console.error("[Favorites] Erro ao remover favorito:", error);
        throw error;
      }
    }),

  /**
   * Listar favoritos do usuário
   */
  listarFavoritos: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      const result = await db
        .select({
          id: imoveis.id,
          titulo: imoveis.titulo,
          descricao: imoveis.descricao,
          bairro: imoveis.bairro,
          cidade: imoveis.cidade,
          valorAluguel: imoveis.valorAluguel,
          desconto: imoveis.desconto,
          status: imoveis.status,
          dataCriacao: favoritos.createdAt,
        })
        .from(favoritos)
        .innerJoin(imoveis, eq(favoritos.imovelId, imoveis.id))
        .where(eq(favoritos.userId, ctx.user!.id))
        .orderBy(desc(favoritos.createdAt));

      return result;
    } catch (error) {
      console.error("[Favorites] Erro ao listar favoritos:", error);
      throw error;
    }
  }),

  /**
   * Verificar se um imóvel está nos favoritos
   */
  isFavorito: protectedProcedure
    .input(z.object({ imovelId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const result = await db
          .select()
          .from(favoritos)
          .where(
            and(
              eq(favoritos.userId, ctx.user!.id),
              eq(favoritos.imovelId, input.imovelId)
            )
          )
          .limit(1);

        return result.length > 0;
      } catch (error) {
        console.error("[Favorites] Erro ao verificar favorito:", error);
        throw error;
      }
    }),

  /**
   * Registrar acesso/busca no histórico
   */
  registrarAcesso: publicProcedure
    .input(
      z.object({
        imovelId: z.number().optional(),
        tipo: z.enum(["visualizacao", "busca", "contato"]),
        parametrosBusca: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await db.insert(historicoAcesso).values({
          imovelId: input.imovelId,
          tipo: input.tipo,
          parametrosBusca: input.parametrosBusca
            ? JSON.stringify(input.parametrosBusca)
            : null,
          dataAcesso: new Date(),
        });

        return { success: true };
      } catch (error) {
        console.error("[Favorites] Erro ao registrar acesso:", error);
        throw error;
      }
    }),

  /**
   * Obter histórico de acessos do usuário
   */
  obterHistorico: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      // Obter últimos 20 acessos
      const result = await db
        .select({
          id: historicoAcesso.id,
          tipo: historicoAcesso.tipo,
          dataAcesso: historicoAcesso.dataAcesso,
          imovel: {
            id: imoveis.id,
            titulo: imoveis.titulo,
            bairro: imoveis.bairro,
          },
        })
        .from(historicoAcesso)
        .leftJoin(imoveis, eq(historicoAcesso.imovelId, imoveis.id))
        .orderBy(desc(historicoAcesso.dataAcesso))
        .limit(20);

      return result;
    } catch (error) {
      console.error("[Favorites] Erro ao obter histórico:", error);
      throw error;
    }
  }),

  /**
   * Obter sugestões baseadas em histórico
   */
  obterSugestoesPersonalizadas: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      // Obter bairros mais visitados
      const historicoRecente = await db
        .select({
          bairro: historicoAcesso.parametrosBusca,
        })
        .from(historicoAcesso)
        .orderBy(desc(historicoAcesso.dataAcesso))
        .limit(10);

      // Extrair bairros do histórico
      const bairros = new Set<string>();
      historicoRecente.forEach((h) => {
        if (h.bairro && typeof h.bairro === "string") {
          try {
            const params = JSON.parse(h.bairro);
            if (params.bairro) bairros.add(params.bairro);
          } catch (e) {
            // Ignorar erros de parse
          }
        }
      });

      // Se não houver bairros no histórico, retornar sugestões genéricas
      if (bairros.size === 0) {
        const sugestoes = await db
          .select()
          .from(imoveis)
          .orderBy(desc(imoveis.visualizacoes))
          .limit(6);

        return sugestoes;
      }

      // Buscar imóveis nos bairros visitados
      const bairrosArray = Array.from(bairros);
      const sugestoes = await db
        .select()
        .from(imoveis)
        .where(eq(imoveis.bairro, bairrosArray[0]))
        .limit(6);

      return sugestoes;
    } catch (error) {
      console.error("[Favorites] Erro ao obter sugestões:", error);
      throw error;
    }
  }),
});
