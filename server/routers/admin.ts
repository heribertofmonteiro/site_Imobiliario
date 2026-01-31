import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { getDb } from "../db";
import { imoveis, contatos } from "../../drizzle/schema";
import { clearCacheByPattern } from "../cache";

/**
 * Router para funcionalidades de administração
 * Requer autenticação e role 'admin'
 */
export const adminRouter = router({
  /**
   * Dashboard - Estatísticas gerais
   */
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Acesso negado: apenas administradores");
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      // Total de imóveis
      const totalImoveis = await db.execute(
        `SELECT COUNT(*) as total FROM imoveis` as any
      );

      // Imóveis por status
      const imovelsPorStatus = await db.execute(
        `SELECT status, COUNT(*) as total FROM imoveis GROUP BY status` as any
      );

      // Total de leads
      const totalLeads = await db.execute(
        `SELECT COUNT(*) as total FROM contatos` as any
      );

      // Leads não respondidos
      const leadsNaoRespondidos = await db.execute(
        `SELECT COUNT(*) as total FROM contatos WHERE status_contato = 'novo'` as any
      );

      // Imóvel mais visualizado
      const imovelMaisVisto = await db.execute(
        `SELECT titulo, visualizacoes FROM imoveis ORDER BY visualizacoes DESC LIMIT 1` as any
      );

      return {
        totalImoveis: (totalImoveis as any)[0]?.total || 0,
        imovelsPorStatus: imovelsPorStatus,
        totalLeads: (totalLeads as any)[0]?.total || 0,
        leadsNaoRespondidos: (leadsNaoRespondidos as any)[0]?.total || 0,
        imovelMaisVisto: (imovelMaisVisto as any)[0] || null,
      };
    } catch (error) {
      console.error("[Admin] Erro ao obter estatísticas:", error);
      throw error;
    }
  }),

  /**
   * Listar todos os imóveis (com paginação)
   */
  listImoveis: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
        status: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Acesso negado");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const offset = (input.page - 1) * input.limit;

        let query: any = db.select().from(imoveis).orderBy(desc(imoveis.dataPublicacao));

        if (input.status) {
          query = query.where(eq(imoveis.status, input.status as any));
        }

        const result = await query.limit(input.limit).offset(offset);

        // Total de registros
        const total = await db.execute(
          `SELECT COUNT(*) as total FROM imoveis ${input.status ? `WHERE status = '${input.status}'` : ""}` as any
        );

        return {
          data: result,
          total: (total as any)[0]?.total || 0,
          page: input.page,
          limit: input.limit,
        };
      } catch (error) {
        console.error("[Admin] Erro ao listar imóveis:", error);
        throw error;
      }
    }),

  /**
   * Criar novo imóvel
   */
  createImovel: protectedProcedure
    .input(
      z.object({
        titulo: z.string().min(5),
        descricao: z.string().min(20),
        valorAluguel: z.string().or(z.number()),
        tipoImovelId: z.number(),
        endereco: z.string(),
        bairro: z.string(),
        cidade: z.string(),
        estado: z.string().length(2),
        cep: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        status: z.enum(["disponivel", "alugado", "promocao", "imperdivel"]),
        desconto: z.number().min(0).max(100).default(0),
        imagemPrincipal: z.string().optional(),
        quartos: z.number().optional(),
        banheiros: z.number().optional(),
        areaTotal: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Acesso negado");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Gerar SEO slug
        const seoSlug = `${input.titulo.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

        const result = await db.insert(imoveis).values({
          titulo: input.titulo,
          descricao: input.descricao,
          valorAluguel: String(input.valorAluguel),
          tipoImovelId: input.tipoImovelId,
          endereco: input.endereco,
          bairro: input.bairro,
          cidade: input.cidade,
          estado: input.estado,
          cep: input.cep,
          latitude: String(input.latitude),
          longitude: String(input.longitude),
          status: input.status,
          desconto: input.desconto,
          imagemPrincipal: input.imagemPrincipal,
          quartos: input.quartos,
          banheiros: input.banheiros,
          areaTotal: input.areaTotal,
          seoSlug,
          ativo: true,
        });

        // Limpar cache
        await clearCacheByPattern("imoveis:*");

        return { success: true, id: (result as any).insertId };
      } catch (error) {
        console.error("[Admin] Erro ao criar imóvel:", error);
        throw error;
      }
    }),

  /**
   * Atualizar imóvel
   */
  updateImovel: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        titulo: z.string().optional(),
        descricao: z.string().optional(),
        valorAluguel: z.string().or(z.number()).optional(),
        status: z.enum(["disponivel", "alugado", "promocao", "imperdivel"]).optional(),
        desconto: z.number().optional(),
        imagemPrincipal: z.string().optional(),
        quartos: z.number().optional(),
        banheiros: z.number().optional(),
        areaTotal: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Acesso negado");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const { id, ...updateData } = input;
        const setData: any = {};
        
        if (updateData.titulo) setData.titulo = updateData.titulo;
        if (updateData.descricao) setData.descricao = updateData.descricao;
        if (updateData.valorAluguel) setData.valorAluguel = String(updateData.valorAluguel);
        if (updateData.status) setData.status = updateData.status;
        if (updateData.desconto !== undefined) setData.desconto = updateData.desconto;
        if (updateData.imagemPrincipal) setData.imagemPrincipal = updateData.imagemPrincipal;
        if (updateData.quartos !== undefined) setData.quartos = updateData.quartos;
        if (updateData.banheiros !== undefined) setData.banheiros = updateData.banheiros;
        if (updateData.areaTotal !== undefined) setData.areaTotal = updateData.areaTotal;

        await db.update(imoveis).set(setData).where(eq(imoveis.id, id));

        // Limpar cache
        await clearCacheByPattern("imoveis:*");

        return { success: true };
      } catch (error) {
        console.error("[Admin] Erro ao atualizar imóvel:", error);
        throw error;
      }
    }),

  /**
   * Deletar imóvel
   */
  deleteImovel: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Acesso negado");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await db.delete(imoveis).where(eq(imoveis.id, input.id));

        // Limpar cache
        await clearCacheByPattern("imoveis:*");

        return { success: true };
      } catch (error) {
        console.error("[Admin] Erro ao deletar imóvel:", error);
        throw error;
      }
    }),

  /**
   * Listar leads/contatos
   */
  listLeads: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
        status: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Acesso negado");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const offset = (input.page - 1) * input.limit;

        let query: any = db.select().from(contatos).orderBy(desc(contatos.createdAt));

        if (input.status) {
          query = query.where(eq(contatos.statusContato, input.status as any));
        }

        const result = await query.limit(input.limit).offset(offset);

        const total = await db.execute(
          `SELECT COUNT(*) as total FROM contatos ${input.status ? `WHERE status_contato = '${input.status}'` : ""}` as any
        );

        return {
          data: result,
          total: (total as any)[0]?.total || 0,
          page: input.page,
          limit: input.limit,
        };
      } catch (error) {
        console.error("[Admin] Erro ao listar leads:", error);
        throw error;
      }
    }),

  /**
   * Atualizar status de lead
   */
  updateLeadStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["novo", "respondido", "descartado"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Acesso negado");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await db
          .update(contatos)
          .set({ statusContato: input.status })
          .where(eq(contatos.id, input.id));

        return { success: true };
      } catch (error) {
        console.error("[Admin] Erro ao atualizar lead:", error);
        throw error;
      }
    }),

  /**
   * Deletar lead
   */
  deleteLead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Acesso negado");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await db.delete(contatos).where(eq(contatos.id, input.id));

        return { success: true };
      } catch (error) {
        console.error("[Admin] Erro ao deletar lead:", error);
        throw error;
      }
    }),

  /**
   * Configurar promoção (status e desconto)
   */
  configurePromotion: protectedProcedure
    .input(
      z.object({
        imovelId: z.number(),
        status: z.enum(["disponivel", "alugado", "promocao", "imperdivel"]),
        desconto: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Acesso negado");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await db
          .update(imoveis)
          .set({
            status: input.status,
            desconto: input.desconto,
          })
          .where(eq(imoveis.id, input.imovelId));

        // Limpar cache
        await clearCacheByPattern("ofertas:*");

        return { success: true };
      } catch (error) {
        console.error("[Admin] Erro ao configurar promoção:", error);
        throw error;
      }
    }),
});
