import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { eq, desc, avg } from "drizzle-orm";
import { avaliacoes, imoveis } from "../../drizzle/schema";

/**
 * Router para gerenciar avaliações e comentários
 */
export const reviewsRouter = router({
  /**
   * Criar nova avaliação
   */
  criarAvaliacao: protectedProcedure
    .input(
      z.object({
        imovelId: z.number(),
        rating: z.number().min(1).max(5),
        titulo: z.string().min(5).max(200),
        comentario: z.string().min(10).max(1000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Verificar se o imóvel existe
        const imovel = await db
          .select()
          .from(imoveis)
          .where(eq(imoveis.id, input.imovelId))
          .limit(1);

        if (!imovel || imovel.length === 0) {
          throw new Error("Imóvel não encontrado");
        }

        // Verificar se usuário já avaliou este imóvel
        const avaliacaoExistente = await db
          .select()
          .from(avaliacoes)
          .where(
            eq(avaliacoes.imovelId, input.imovelId) &&
            eq(avaliacoes.userId, ctx.user!.id)
          )
          .limit(1);

        if (avaliacaoExistente.length > 0) {
          // Atualizar avaliação existente
          await db
            .update(avaliacoes)
            .set({
              rating: input.rating,
              titulo: input.titulo,
              comentario: input.comentario,
              updatedAt: new Date(),
            })
            .where(eq(avaliacoes.id, avaliacaoExistente[0].id));

          return { success: true, message: "Avaliação atualizada com sucesso" };
        }

        // Criar nova avaliação
        await db.insert(avaliacoes).values({
          imovelId: input.imovelId,
          userId: ctx.user!.id,
          rating: input.rating,
          titulo: input.titulo,
          comentario: input.comentario,
          dataAvaliacao: new Date(),
        });

        return { success: true, message: "Avaliação criada com sucesso" };
      } catch (error) {
        console.error("[Reviews] Erro ao criar avaliação:", error);
        throw error;
      }
    }),

  /**
   * Listar avaliações de um imóvel
   */
  listarAvaliacoes: publicProcedure
    .input(z.object({ imovelId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const result = await db
          .select({
            id: avaliacoes.id,
            rating: avaliacoes.rating,
            titulo: avaliacoes.titulo,
            comentario: avaliacoes.comentario,
            dataAvaliacao: avaliacoes.dataAvaliacao,
          })
          .from(avaliacoes)
          .where(eq(avaliacoes.imovelId, input.imovelId))
          .orderBy(desc(avaliacoes.dataAvaliacao));

        return result;
      } catch (error) {
        console.error("[Reviews] Erro ao listar avaliações:", error);
        throw error;
      }
    }),

  /**
   * Obter estatísticas de avaliações de um imóvel
   */
  obterEstatisticasAvaliacoes: publicProcedure
    .input(z.object({ imovelId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const todasAvaliacoes = await db
          .select()
          .from(avaliacoes)
          .where(eq(avaliacoes.imovelId, input.imovelId));

        if (todasAvaliacoes.length === 0) {
          return {
            total: 0,
            media: 0,
            distribuicao: {
              5: 0,
              4: 0,
              3: 0,
              2: 0,
              1: 0,
            },
          };
        }

        // Calcular distribuição
        const distribuicao = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let somaRatings = 0;

        todasAvaliacoes.forEach((av) => {
          somaRatings += av.rating;
          distribuicao[av.rating as keyof typeof distribuicao]++;
        });

        const media = (somaRatings / todasAvaliacoes.length).toFixed(1);

        return {
          total: todasAvaliacoes.length,
          media: parseFloat(media),
          distribuicao,
        };
      } catch (error) {
        console.error("[Reviews] Erro ao obter estatísticas:", error);
        throw error;
      }
    }),

  /**
   * Deletar avaliação (apenas o autor ou admin)
   */
  deletarAvaliacao: protectedProcedure
    .input(z.object({ avaliacaoId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Verificar se a avaliação existe e pertence ao usuário
        const avaliacao = await db
          .select()
          .from(avaliacoes)
          .where(eq(avaliacoes.id, input.avaliacaoId))
          .limit(1);

        if (!avaliacao || avaliacao.length === 0) {
          throw new Error("Avaliação não encontrada");
        }

        // Verificar permissão
        if (avaliacao[0].userId !== ctx.user!.id && ctx.user!.role !== "admin") {
          throw new Error("Você não tem permissão para deletar esta avaliação");
        }

        // Deletar
        await db.delete(avaliacoes).where(eq(avaliacoes.id, input.avaliacaoId));

        return { success: true, message: "Avaliação deletada com sucesso" };
      } catch (error) {
        console.error("[Reviews] Erro ao deletar avaliação:", error);
        throw error;
      }
    }),

  /**
   * Obter avaliações do usuário
   */
  minhasAvaliacoes: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      const result = await db
        .select({
          id: avaliacoes.id,
          imovelId: avaliacoes.imovelId,
          imovelTitulo: imoveis.titulo,
          rating: avaliacoes.rating,
          titulo: avaliacoes.titulo,
          comentario: avaliacoes.comentario,
          dataAvaliacao: avaliacoes.dataAvaliacao,
        })
        .from(avaliacoes)
        .leftJoin(imoveis, eq(avaliacoes.imovelId, imoveis.id))
        .where(eq(avaliacoes.userId, ctx.user!.id))
        .orderBy(desc(avaliacoes.dataAvaliacao));

      return result;
    } catch (error) {
      console.error("[Reviews] Erro ao obter minhas avaliações:", error);
      throw error;
    }
  }),
});
