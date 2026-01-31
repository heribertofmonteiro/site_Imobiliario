import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { imagensImovel } from "../../drizzle/schema";
import { storagePut } from "../storage";

/**
 * Router para gerenciamento de mídia (imagens)
 */
export const mediaRouter = router({
  /**
   * Upload de imagem para imóvel
   */
  uploadImagemImovel: protectedProcedure
    .input(
      z.object({
        imovelId: z.number(),
        base64Data: z.string(), // Imagem em base64
        mimeType: z.string(), // ex: image/jpeg
        ordem: z.number().optional().default(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Acesso negado");
      }

      try {
        // Converter base64 para buffer
        const buffer = Buffer.from(input.base64Data, "base64");

        // Gerar nome único para a imagem
        const fileName = `imovel-${input.imovelId}-${Date.now()}.jpg`;
        const fileKey = `imoveis/${input.imovelId}/${fileName}`;

        // Upload para S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        // Salvar referência no banco de dados
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(imagensImovel).values({
          imovelId: input.imovelId,
          url,
          ordem: input.ordem,
        });

        return {
          success: true,
          url,
          id: (result as any).insertId,
        };
      } catch (error) {
        console.error("[Media] Erro ao fazer upload:", error);
        throw error;
      }
    }),

  /**
   * Listar imagens de um imóvel
   */
  listImagensImovel: protectedProcedure
    .input(z.object({ imovelId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const imagens = await db
          .select()
          .from(imagensImovel)
          .where(eq(imagensImovel.imovelId, input.imovelId))
          .orderBy(imagensImovel.ordem);

        return imagens;
      } catch (error) {
        console.error("[Media] Erro ao listar imagens:", error);
        throw error;
      }
    }),

  /**
   * Deletar imagem
   */
  deleteImagem: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Acesso negado");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await db.delete(imagensImovel).where(eq(imagensImovel.id, input.id));

        return { success: true };
      } catch (error) {
        console.error("[Media] Erro ao deletar imagem:", error);
        throw error;
      }
    }),

  /**
   * Reordenar imagens
   */
  reorderImagens: protectedProcedure
    .input(
      z.object({
        imagens: z.array(
          z.object({
            id: z.number(),
            ordem: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Acesso negado");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        for (const img of input.imagens) {
          await db
            .update(imagensImovel)
            .set({ ordem: img.ordem })
            .where(eq(imagensImovel.id, img.id));
        }

        return { success: true };
      } catch (error) {
        console.error("[Media] Erro ao reordenar imagens:", error);
        throw error;
      }
    }),

  /**
   * Obter URL presignada para download
   */
  getPresignedUrl: protectedProcedure
    .input(z.object({ imagemId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const imagem = await db
          .select()
          .from(imagensImovel)
          .where(eq(imagensImovel.id, input.imagemId))
          .limit(1);

        if (!imagem || imagem.length === 0) {
          throw new Error("Imagem não encontrada");
        }

        // Retornar URL da imagem
        return { url: imagem[0].url };
      } catch (error) {
        console.error("[Media] Erro ao obter URL presignada:", error);
        throw error;
      }
    }),
});
