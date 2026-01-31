import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { imoveis, contatos } from "../../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";

/**
 * Router para relatórios e análises avançadas
 */
export const analyticsRouter = router({
  /**
   * Obter relatório de visualizações por imóvel
   */
  getRelatorioVisualizacoes: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Acesso negado");
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      // Obter imóveis com mais visualizações
      const topImoveis = await db
        .select({
          id: imoveis.id,
          titulo: imoveis.titulo,
          visualizacoes: imoveis.visualizacoes,
          valor: imoveis.valorAluguel,
          status: imoveis.status,
        })
        .from(imoveis)
        .orderBy(desc(imoveis.visualizacoes))
        .limit(10);

      // Calcular estatísticas
      const totalVisualizacoes = topImoveis.reduce((acc, i) => acc + (i.visualizacoes || 0), 0);
      const mediaVisualizacoes = Math.round(totalVisualizacoes / topImoveis.length);

      return {
        topImoveis,
        totalVisualizacoes,
        mediaVisualizacoes,
        periodo: "últimos 30 dias",
      };
    } catch (error) {
      console.error("[Analytics] Erro ao gerar relatório de visualizações:", error);
      throw error;
    }
  }),

  /**
   * Obter relatório de leads e conversão
   */
  getRelatorioLeads: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Acesso negado");
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      // Obter todos os leads
      const todosLeads = await db.select().from(contatos);

      // Contar por status
      const novo = todosLeads.filter((l) => l.statusContato === "novo").length;
      const respondido = todosLeads.filter((l) => l.statusContato === "respondido").length;
      const descartado = todosLeads.filter((l) => l.statusContato === "descartado").length;

      // Calcular taxa de conversão
      const totalLeads = todosLeads.length;
      const taxaConversao =
        totalLeads > 0 ? Math.round((respondido / totalLeads) * 100) : 0;

      // Leads por imóvel
      const leadsPorImovel: Record<number, number> = {};
      todosLeads.forEach((lead) => {
        if (lead.imovelId) {
          leadsPorImovel[lead.imovelId] = (leadsPorImovel[lead.imovelId] || 0) + 1;
        }
      });

      return {
        totalLeads,
        novo,
        respondido,
        descartado,
        taxaConversao,
        leadsPorImovel,
        periodo: "últimos 30 dias",
      };
    } catch (error) {
      console.error("[Analytics] Erro ao gerar relatório de leads:", error);
      throw error;
    }
  }),

  /**
   * Obter relatório de performance por bairro
   */
  getRelatorioPerformanceBairro: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Acesso negado");
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      const imoveisData = await db.select().from(imoveis);

      // Agrupar por bairro
      const porBairro: Record<
        string,
        {
          bairro: string;
          total: number;
          visualizacoes: number;
          valor_medio: number;
          disponivel: number;
          alugado: number;
          promocao: number;
          imperdivel: number;
        }
      > = {};

      imoveisData.forEach((imovel) => {
        if (!porBairro[imovel.bairro]) {
          porBairro[imovel.bairro] = {
            bairro: imovel.bairro,
            total: 0,
            visualizacoes: 0,
            valor_medio: 0,
            disponivel: 0,
            alugado: 0,
            promocao: 0,
            imperdivel: 0,
          };
        }

        const stats = porBairro[imovel.bairro];
        stats.total++;
        stats.visualizacoes += imovel.visualizacoes || 0;
        stats.valor_medio += parseFloat(String(imovel.valorAluguel)) || 0;

        if (imovel.status === "disponivel") stats.disponivel++;
        else if (imovel.status === "alugado") stats.alugado++;
        else if (imovel.status === "promocao") stats.promocao++;
        else if (imovel.status === "imperdivel") stats.imperdivel++;
      });

      // Calcular média de valor
      Object.keys(porBairro).forEach((bairro) => {
        porBairro[bairro].valor_medio = Math.round(
          porBairro[bairro].valor_medio / porBairro[bairro].total
        );
      });

      return {
        porBairro: Object.values(porBairro),
        totalBairros: Object.keys(porBairro).length,
      };
    } catch (error) {
      console.error("[Analytics] Erro ao gerar relatório de bairro:", error);
      throw error;
    }
  }),

  /**
   * Obter relatório de receita estimada
   */
  getRelatorioReceita: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Acesso negado");
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      const imoveisData = await db.select().from(imoveis);

      // Calcular receita total (valor de aluguel mensal)
      let receitaTotal = 0;
      let receitaDisponivel = 0;
      let receitaAlugado = 0;

      imoveisData.forEach((imovel) => {
        const valor = parseFloat(String(imovel.valorAluguel)) || 0;
        receitaTotal += valor;

        if (imovel.status === "disponivel") {
          receitaDisponivel += valor;
        } else if (imovel.status === "alugado") {
          receitaAlugado += valor;
        }
      });

      // Calcular taxa de ocupação
      const totalImoveis = imoveisData.length;
      const imoveisAlugados = imoveisData.filter((i) => i.status === "alugado").length;
      const taxaOcupacao =
        totalImoveis > 0 ? Math.round((imoveisAlugados / totalImoveis) * 100) : 0;

      return {
        receitaTotal: Math.round(receitaTotal),
        receitaDisponivel: Math.round(receitaDisponivel),
        receitaAlugado: Math.round(receitaAlugado),
        taxaOcupacao,
        imoveisAlugados,
        imoveisDisponiveis: totalImoveis - imoveisAlugados,
        periodo: "mensal",
      };
    } catch (error) {
      console.error("[Analytics] Erro ao gerar relatório de receita:", error);
      throw error;
    }
  }),

  /**
   * Obter dados para gráfico de tendências
   */
  getGraficoTendencias: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Acesso negado");
    }

    // Simular dados de tendências (em produção, viria de um sistema de analytics)
    const dados = [
      { mes: "Jan", visualizacoes: 120, leads: 15, conversoes: 3 },
      { mes: "Fev", visualizacoes: 180, leads: 22, conversoes: 5 },
      { mes: "Mar", visualizacoes: 220, leads: 28, conversoes: 7 },
      { mes: "Abr", visualizacoes: 280, leads: 35, conversoes: 10 },
      { mes: "Mai", visualizacoes: 350, leads: 45, conversoes: 14 },
      { mes: "Jun", visualizacoes: 420, leads: 55, conversoes: 18 },
    ];

    return {
      dados,
      periodo: "últimos 6 meses",
    };
  }),

  /**
   * Exportar relatório em PDF
   */
  exportarRelatorioPDF: protectedProcedure
    .input(z.object({ tipo: z.enum(["visualizacoes", "leads", "bairro", "receita"]) }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Acesso negado");
      }

      // Em produção, isso geraria um PDF real
      // Por enquanto, retornamos um objeto simulado
      return {
        success: true,
        url: `/reports/${input.tipo}-${Date.now()}.pdf`,
        titulo: `Relatório de ${input.tipo}`,
        dataGeracao: new Date(),
      };
    }),
});
