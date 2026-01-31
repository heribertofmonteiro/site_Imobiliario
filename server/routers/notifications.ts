import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { eq } from "drizzle-orm";
import { imoveis } from "../../drizzle/schema";

/**
 * Router para notificações em tempo real
 * Simula notificações dinâmicas sem WebSocket nativo
 */
export const notificationsRouter = router({
  /**
   * Obter estatísticas de visualização de um imóvel
   * Simula: "X pessoas visualizaram este imóvel nos últimos 2 minutos"
   */
  getVisualizacoesDinamicas: publicProcedure
    .input(z.object({ imovelId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const imovel = await db
          .select()
          .from(imoveis)
          .where(eq(imoveis.id, input.imovelId))
          .limit(1);

        if (!imovel || imovel.length === 0) {
          throw new Error("Imóvel não encontrado");
        }

        // Simular visualizações dinâmicas
        // Em produção, isso viria de um sistema de analytics em tempo real
        const visualizacoes = imovel[0].visualizacoes || 0;
        const visualizacoesUltimos2Min = Math.max(
          1,
          Math.floor(Math.random() * Math.min(visualizacoes, 10))
        );

        return {
          imovelId: input.imovelId,
          totalVisualizacoes: visualizacoes,
          visualizacoesUltimos2Min,
          mensagem: `${visualizacoesUltimos2Min} ${
            visualizacoesUltimos2Min === 1 ? "pessoa visualizou" : "pessoas visualizaram"
          } este imóvel nos últimos 2 minutos`,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("[Notifications] Erro ao obter visualizações:", error);
        throw error;
      }
    }),

  /**
   * Obter notificações de urgência para ofertas imperdíveis
   * Simula: "Oferta expira em X horas"
   */
  getNotificacoesUrgencia: publicProcedure
    .input(z.object({ imovelId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const imovel = await db
          .select()
          .from(imoveis)
          .where(eq(imoveis.id, input.imovelId))
          .limit(1);

        if (!imovel || imovel.length === 0) {
          throw new Error("Imóvel não encontrado");
        }

        const imv = imovel[0];

        // Se for oferta imperdível, gerar notificação de urgência
        if (imv.status === "imperdivel") {
          // Simular tempo de expiração (entre 2 a 48 horas)
          const horasRestantes = Math.floor(Math.random() * 46) + 2;

          return {
            imovelId: input.imovelId,
            tipo: "urgencia",
            titulo: "Oferta Imperdível!",
            mensagem: `Esta oferta expira em ${horasRestantes} ${
              horasRestantes === 1 ? "hora" : "horas"
            }`,
            horasRestantes,
            desconto: imv.desconto || 0,
            mostrar: true,
          };
        }

        // Se for promoção, gerar notificação de promoção
        if (imv.status === "promocao") {
          return {
            imovelId: input.imovelId,
            tipo: "promocao",
            titulo: "Em Promoção!",
            mensagem: `Desconto de ${imv.desconto || 0}% neste imóvel`,
            desconto: imv.desconto || 0,
            mostrar: true,
          };
        }

        return {
          imovelId: input.imovelId,
          tipo: "normal",
          mostrar: false,
        };
      } catch (error) {
        console.error("[Notifications] Erro ao obter notificações de urgência:", error);
        throw error;
      }
    }),

  /**
   * Obter notificações de prova social
   * Simula: "5 pessoas salvaram este imóvel como favorito"
   */
  getNotificacoesProvaSocial: publicProcedure
    .input(z.object({ imovelId: z.number() }))
    .query(async ({ input }) => {
      // Simular dados de prova social
      // Em produção, isso viria do banco de dados
      const favoritos = Math.floor(Math.random() * 50) + 1;
      const contatosRecentes = Math.floor(Math.random() * 20) + 1;

      return {
        imovelId: input.imovelId,
        favoritos,
        contatosRecentes,
        mensagens: [
          `${favoritos} ${favoritos === 1 ? "pessoa salvou" : "pessoas salvaram"} este imóvel como favorito`,
          `${contatosRecentes} ${
            contatosRecentes === 1 ? "pessoa entrou em contato" : "pessoas entraram em contato"
          } nos últimos 7 dias`,
        ],
        mostrar: true,
      };
    }),

  /**
   * Obter depoimentos dinâmicos de clientes
   */
  getDepoimentos: publicProcedure.query(async () => {
    // Depoimentos simulados
    const depoimentos = [
      {
        id: 1,
        nome: "João Silva",
        foto: "https://i.pravatar.cc/150?img=1",
        titulo: "Excelente experiência!",
        texto: "Encontrei o imóvel perfeito em poucos minutos. O atendimento foi impecável!",
        rating: 5,
      },
      {
        id: 2,
        nome: "Maria Santos",
        foto: "https://i.pravatar.cc/150?img=2",
        titulo: "Muito satisfeita",
        texto: "O processo foi rápido e transparente. Recomendo para todos!",
        rating: 5,
      },
      {
        id: 3,
        nome: "Pedro Costa",
        foto: "https://i.pravatar.cc/150?img=3",
        titulo: "Ótima plataforma",
        texto: "Muitas opções de imóveis e preços competitivos. Voltarei a usar!",
        rating: 4,
      },
      {
        id: 4,
        nome: "Ana Oliveira",
        foto: "https://i.pravatar.cc/150?img=4",
        titulo: "Perfeito!",
        texto: "Encontrei meu novo lar aqui. Muito obrigada!",
        rating: 5,
      },
      {
        id: 5,
        nome: "Carlos Mendes",
        foto: "https://i.pravatar.cc/150?img=5",
        titulo: "Recomendo",
        texto: "Ótima seleção de imóveis e atendimento responsivo.",
        rating: 4,
      },
    ];

    return {
      depoimentos,
      total: depoimentos.length,
      mediaRating: (depoimentos.reduce((acc, d) => acc + d.rating, 0) / depoimentos.length).toFixed(1),
    };
  }),

  /**
   * Obter notificações de imóveis similares
   * Simula: "Você pode gostar destes imóveis"
   */
  getNotificacoesSimilares: publicProcedure
    .input(z.object({ imovelId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const imovel = await db
          .select()
          .from(imoveis)
          .where(eq(imoveis.id, input.imovelId))
          .limit(1);

        if (!imovel || imovel.length === 0) {
          throw new Error("Imóvel não encontrado");
        }

        // Simular busca de imóveis similares
        // Em produção, isso seria uma busca real no banco de dados
        const similares = await db
          .select()
          .from(imoveis)
          .where(eq(imoveis.bairro, imovel[0].bairro))
          .limit(3);

        return {
          imovelId: input.imovelId,
          similares,
          mensagem: `Encontramos ${similares.length} imóvel(is) similar(es) em ${imovel[0].bairro}`,
          mostrar: similares.length > 0,
        };
      } catch (error) {
        console.error("[Notifications] Erro ao obter similares:", error);
        throw error;
      }
    }),
});
