import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { eq } from "drizzle-orm";
import { configuracoesNotificacoes, contatos, imoveis } from "../../drizzle/schema";

/**
 * Router para integração com WhatsApp e Telegram
 * Simula envio de mensagens (em produção, integraria com APIs reais)
 */
export const messagingRouter = router({
  /**
   * Configurar notificações do usuário
   */
  configurarNotificacoes: protectedProcedure
    .input(
      z.object({
        whatsappNumero: z.string().optional(),
        whatsappAtivo: z.boolean().optional(),
        telegramChatId: z.string().optional(),
        telegramAtivo: z.boolean().optional(),
        emailNotificacoes: z.boolean().optional(),
        notificacoesNovoImovel: z.boolean().optional(),
        notificacoesOfertasImperdivel: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Verificar se já existe configuração
        const configExistente = await db
          .select()
          .from(configuracoesNotificacoes)
          .where(eq(configuracoesNotificacoes.userId, ctx.user!.id))
          .limit(1);

        if (configExistente.length > 0) {
          // Atualizar
          await db
            .update(configuracoesNotificacoes)
            .set({
              whatsappNumero: input.whatsappNumero,
              whatsappAtivo: input.whatsappAtivo,
              telegramChatId: input.telegramChatId,
              telegramAtivo: input.telegramAtivo,
              emailNotificacoes: input.emailNotificacoes,
              notificacoesNovoImovel: input.notificacoesNovoImovel,
              notificacoesOfertasImperdivel: input.notificacoesOfertasImperdivel,
              updatedAt: new Date(),
            })
            .where(eq(configuracoesNotificacoes.userId, ctx.user!.id));
        } else {
          // Criar
          await db.insert(configuracoesNotificacoes).values({
            userId: ctx.user!.id,
            whatsappNumero: input.whatsappNumero,
            whatsappAtivo: input.whatsappAtivo || false,
            telegramChatId: input.telegramChatId,
            telegramAtivo: input.telegramAtivo || false,
            emailNotificacoes: input.emailNotificacoes !== false,
            notificacoesNovoImovel: input.notificacoesNovoImovel !== false,
            notificacoesOfertasImperdivel: input.notificacoesOfertasImperdivel !== false,
          });
        }

        return { success: true, message: "Configurações salvas com sucesso" };
      } catch (error) {
        console.error("[Messaging] Erro ao configurar notificações:", error);
        throw error;
      }
    }),

  /**
   * Obter configurações de notificações do usuário
   */
  obterConfiguracoes: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      const config = await db
        .select()
        .from(configuracoesNotificacoes)
        .where(eq(configuracoesNotificacoes.userId, ctx.user!.id))
        .limit(1);

      if (config.length === 0) {
        return null;
      }

      return config[0];
    } catch (error) {
      console.error("[Messaging] Erro ao obter configurações:", error);
      throw error;
    }
  }),

  /**
   * Enviar mensagem via WhatsApp (simulado)
   */
  enviarWhatsApp: protectedProcedure
    .input(
      z.object({
        numero: z.string(),
        mensagem: z.string(),
        imovelId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Em produção, isso integraria com a API do WhatsApp Business
        // Por enquanto, apenas simulamos o envio

        console.log(`[WhatsApp] Enviando para ${input.numero}: ${input.mensagem}`);

        // Simular delay de envio
        await new Promise((resolve) => setTimeout(resolve, 500));

        return {
          success: true,
          message: "Mensagem enviada com sucesso via WhatsApp",
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("[Messaging] Erro ao enviar WhatsApp:", error);
        throw error;
      }
    }),

  /**
   * Enviar mensagem via Telegram (simulado)
   */
  enviarTelegram: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        mensagem: z.string(),
        imovelId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Em produção, isso integraria com a API do Telegram Bot
        // Por enquanto, apenas simulamos o envio

        console.log(`[Telegram] Enviando para ${input.chatId}: ${input.mensagem}`);

        // Simular delay de envio
        await new Promise((resolve) => setTimeout(resolve, 500));

        return {
          success: true,
          message: "Mensagem enviada com sucesso via Telegram",
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("[Messaging] Erro ao enviar Telegram:", error);
        throw error;
      }
    }),

  /**
   * Enviar notificação de novo imóvel
   */
  notificarNovoImovel: protectedProcedure
    .input(
      z.object({
        imovelId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Obter configurações do usuário
        const config = await db
          .select()
          .from(configuracoesNotificacoes)
          .where(eq(configuracoesNotificacoes.userId, ctx.user!.id))
          .limit(1);

        if (!config || config.length === 0 || !config[0].notificacoesNovoImovel) {
          return { success: false, message: "Notificações desativadas" };
        }

        // Obter dados do imóvel
        const imovel = await db
          .select()
          .from(imoveis)
          .where(eq(imoveis.id, input.imovelId))
          .limit(1);

        if (!imovel || imovel.length === 0) {
          throw new Error("Imóvel não encontrado");
        }

        const imv = imovel[0];
        const mensagem = `🏠 Novo imóvel disponível!\n\n${imv.titulo}\n📍 ${imv.bairro}, ${imv.cidade}\n💰 R$ ${imv.valorAluguel}/mês\n\nVer detalhes: [Link]`;

        // Enviar via WhatsApp se configurado
        if (config[0].whatsappAtivo && config[0].whatsappNumero) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          console.log(`[WhatsApp] Notificação enviada para ${config[0].whatsappNumero}`);
        }

        // Enviar via Telegram se configurado
        if (config[0].telegramAtivo && config[0].telegramChatId) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          console.log(`[Telegram] Notificação enviada para ${config[0].telegramChatId}`);
        }

        // Enviar via Email se configurado
        if (config[0].emailNotificacoes) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          console.log(`[Email] Notificação enviada para ${ctx.user!.email}`);
        }

        return {
          success: true,
          message: "Notificação enviada com sucesso",
        };
      } catch (error) {
        console.error("[Messaging] Erro ao notificar novo imóvel:", error);
        throw error;
      }
    }),

  /**
   * Enviar notificação de oferta imperdível
   */
  notificarOfertaImperdivel: protectedProcedure
    .input(
      z.object({
        imovelId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Obter configurações do usuário
        const config = await db
          .select()
          .from(configuracoesNotificacoes)
          .where(eq(configuracoesNotificacoes.userId, ctx.user!.id))
          .limit(1);

        if (!config || config.length === 0 || !config[0].notificacoesOfertasImperdivel) {
          return { success: false, message: "Notificações desativadas" };
        }

        // Obter dados do imóvel
        const imovel = await db
          .select()
          .from(imoveis)
          .where(eq(imoveis.id, input.imovelId))
          .limit(1);

        if (!imovel || imovel.length === 0) {
          throw new Error("Imóvel não encontrado");
        }

        const imv = imovel[0];
        const mensagem = `🔥 OFERTA IMPERDÍVEL!\n\n${imv.titulo}\n📍 ${imv.bairro}, ${imv.cidade}\n💰 R$ ${imv.valorAluguel}/mês (${imv.desconto}% OFF)\n⏰ Oferta expira em breve!\n\nGaranta agora: [Link]`;

        // Enviar via WhatsApp se configurado
        if (config[0].whatsappAtivo && config[0].whatsappNumero) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          console.log(`[WhatsApp] Oferta imperdível enviada para ${config[0].whatsappNumero}`);
        }

        // Enviar via Telegram se configurado
        if (config[0].telegramAtivo && config[0].telegramChatId) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          console.log(`[Telegram] Oferta imperdível enviada para ${config[0].telegramChatId}`);
        }

        // Enviar via Email se configurado
        if (config[0].emailNotificacoes) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          console.log(`[Email] Oferta imperdível enviada para ${ctx.user!.email}`);
        }

        return {
          success: true,
          message: "Notificação de oferta enviada com sucesso",
        };
      } catch (error) {
        console.error("[Messaging] Erro ao notificar oferta:", error);
        throw error;
      }
    }),
});
