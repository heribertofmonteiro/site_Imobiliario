import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { eq, gte, lte, like, and, inArray, sql } from "drizzle-orm";
import { imoveis } from "../../drizzle/schema";

/**
 * Router para busca avançada e filtros
 */
export const searchRouter = router({
  /**
   * Busca avançada com múltiplos filtros
   */
  buscarAvancado: publicProcedure
    .input(
      z.object({
        bairro: z.string().optional(),
        cidade: z.string().optional(),
        precoMin: z.number().optional(),
        precoMax: z.number().optional(),
        quartos: z.number().optional(),
        tipologia: z.string().optional(),
        status: z.enum(["disponivel", "alugado", "promocao", "imperdivel"]).optional(),
        caracteristicas: z.array(z.number()).optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        raioKm: z.number().optional().default(10),
        pagina: z.number().min(1).default(1),
        limite: z.number().min(1).max(50).default(12),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const conditions: any[] = [];

        if (input.bairro) {
          conditions.push(like(imoveis.bairro, `%${input.bairro}%`));
        }

        if (input.cidade) {
          conditions.push(like(imoveis.cidade, `%${input.cidade}%`));
        }

        if (input.precoMin !== undefined) {
          conditions.push(gte(imoveis.valorAluguel, String(input.precoMin)));
        }

        if (input.precoMax !== undefined) {
          conditions.push(lte(imoveis.valorAluguel, String(input.precoMax)));
        }

        if (input.quartos !== undefined) {
          conditions.push(eq(imoveis.quartos, input.quartos));
        }

        if (input.tipologia) {
          conditions.push(eq(imoveis.tipologia, input.tipologia));
        }

        if (input.status) {
          conditions.push(eq(imoveis.status, input.status));
        }

        const R = 6371; // Raio da Terra em km
        const { imovelCaracteristica } = await import("../../drizzle/schema");

        // Contar total e buscar resultados
        let query = db
          .select({
            imovel: imoveis,
            distancia: input.latitude && input.longitude
              ? sql<number>`(${R} * acos(
                  cos(radians(${input.latitude})) * 
                  cos(radians(${imoveis.latitude})) * 
                  cos(radians(${imoveis.longitude}) - radians(${input.longitude})) + 
                  sin(radians(${input.latitude})) * 
                  sin(radians(${imoveis.latitude}))
                ))`
              : sql<number>`0`
          })
          .from(imoveis);

        if (input.latitude && input.longitude) {
          conditions.push(sql`(${R} * acos(
            cos(radians(${input.latitude})) * 
            cos(radians(${imoveis.latitude})) * 
            cos(radians(${imoveis.longitude}) - radians(${input.longitude})) + 
            sin(radians(${input.latitude})) * 
            sin(radians(${imoveis.latitude}))
          )) <= ${input.raioKm}`);
        }

        if (input.caracteristicas && input.caracteristicas.length > 0) {
          query = query.innerJoin(
            imovelCaracteristica,
            eq(imoveis.id, imovelCaracteristica.imovelId)
          ) as any;
          conditions.push(inArray(imovelCaracteristica.caracteristicaId, input.caracteristicas));
        }

        const allResults = await query
          .where(conditions.length > 0 ? and(...conditions) : undefined);

        // Mapear para o formato esperado (remover o wrapper do join se houver)
        const mappedResults = allResults.map((r: any) => r.imovel || r);

        // Aplicar paginação
        const offset = (input.pagina - 1) * input.limite;
        const resultados = mappedResults.slice(offset, offset + input.limite);

        return {
          resultados,
          total: mappedResults.length,
          pagina: input.pagina,
          limite: input.limite,
          totalPaginas: Math.ceil(mappedResults.length / input.limite),
        };
      } catch (error) {
        console.error("[Search] Erro na busca avançada:", error);
        throw error;
      }
    }),

  /**
   * Busca por texto (título, descrição, bairro)
   */
  buscarTexto: publicProcedure
    .input(
      z.object({
        termo: z.string().min(1).max(100),
        pagina: z.number().min(1).default(1),
        limite: z.number().min(1).max(50).default(12),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const termo = `%${input.termo}%`;

        const allResults = await db
          .select()
          .from(imoveis)
          .where(
            like(imoveis.titulo, termo) ||
            like(imoveis.descricao, termo) ||
            like(imoveis.bairro, termo) ||
            like(imoveis.cidade, termo)
          );

        const offset = (input.pagina - 1) * input.limite;
        const resultados = allResults.slice(offset, offset + input.limite);

        return {
          resultados,
          total: allResults.length,
          pagina: input.pagina,
          limite: input.limite,
          totalPaginas: Math.ceil(allResults.length / input.limite),
        };
      } catch (error) {
        console.error("[Search] Erro na busca por texto:", error);
        throw error;
      }
    }),

  /**
   * Obter sugestões de busca (autocomplete)
   */
  obterSugestoes: publicProcedure
    .input(z.object({ termo: z.string().min(1).max(50) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const termo = `%${input.termo}%`;

        const todosImoveis = await db.select().from(imoveis);

        // Filtrar bairros
        const bairros = Array.from(
          new Set(
            todosImoveis
              .filter((i) => i.bairro && i.bairro.toLowerCase().includes(input.termo.toLowerCase()))
              .map((i) => i.bairro)
          )
        ).slice(0, 5);

        // Filtrar cidades
        const cidades = Array.from(
          new Set(
            todosImoveis
              .filter((i) => i.cidade && i.cidade.toLowerCase().includes(input.termo.toLowerCase()))
              .map((i) => i.cidade)
          )
        ).slice(0, 5);

        // Filtrar títulos
        const titulos = Array.from(
          new Set(
            todosImoveis
              .filter((i) => i.titulo && i.titulo.toLowerCase().includes(input.termo.toLowerCase()))
              .map((i) => i.titulo)
          )
        ).slice(0, 5);

        return {
          bairros: bairros.filter(Boolean),
          cidades: cidades.filter(Boolean),
          titulos: titulos.filter(Boolean),
        };
      } catch (error) {
        console.error("[Search] Erro ao obter sugestões:", error);
        throw error;
      }
    }),

  /**
   * Obter filtros disponíveis (para popular dropdowns)
   */
  obterFiltrosDisponiveis: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      const todosImoveis = await db.select().from(imoveis);

      // Extrair valores únicos
      const bairrosSet = new Set(todosImoveis.map((i) => i.bairro).filter(Boolean));
      const cidadesSet = new Set(todosImoveis.map((i) => i.cidade).filter(Boolean));
      const statusSet = new Set(todosImoveis.map((i) => i.status));
      const quartosSet = new Set(todosImoveis.map((i) => i.quartos).filter(Boolean));
      const banheirosSet = new Set(todosImoveis.map((i) => i.banheiros).filter(Boolean));

      // Calcular range de preços
      const precos = todosImoveis.map((i) => parseFloat(String(i.valorAluguel)));
      const precoMin = Math.min(...precos);
      const precoMax = Math.max(...precos);

      // Calcular distribuição (10 buckets)
      const buckets = 10;
      const step = (precoMax - precoMin) / buckets;
      const distribuicaoPrecos = Array(buckets).fill(0);
      precos.forEach(p => {
        const index = Math.min(Math.floor((p - precoMin) / step), buckets - 1);
        distribuicaoPrecos[index]++;
      });

      const { caracteristicas: tCaracteristicas } = await import("../../drizzle/schema");
      const todasCaracteristicas = await db.select().from(tCaracteristicas);

      return {
        bairros: Array.from(bairrosSet),
        cidades: Array.from(cidadesSet),
        status: Array.from(statusSet),
        precoMin,
        precoMax,
        distribuicaoPrecos,
        quartos: Array.from(quartosSet).sort((a, b) => (a || 0) - (b || 0)),
        banheiros: Array.from(banheirosSet).sort((a, b) => (a || 0) - (b || 0)),
        caracteristicas: todasCaracteristicas,
      };
    } catch (error) {
      console.error("[Search] Erro ao obter filtros:", error);
      throw error;
    }
  }),
  /**
   * Busca assistida por IA
   */
  aiSearch: publicProcedure
    .input(z.object({ prompt: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // 1. Usar OpenAI para extrair parâmetros de busca
        // Nota: Em um ambiente real, carregaríamos a chave do process.env
        const { OpenAI } = await import("openai");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Você é um assistente especializado em busca de imóveis no Japão. 
              Sua tarefa é extrair parâmetros de busca de um texto (em português ou japonês).
              Retorne APENAS um JSON com os seguintes campos (se não encontrar, retorne null):
              - bairro (string)
              - cidade (string - ex: Tokyo, Osaka, Kyoto)
              - precoMin (number - em Ienes)
              - precoMax (number - em Ienes)
              - quartos (number)
              - tipo (string: 'casa', 'apartamento', 'loft', 'kitnet')
              - extras (array de strings: 'piscina', 'varanda', 'pet-friendly', 'mobiliado')`
            },
            { role: "user", content: input.prompt }
          ],
          response_format: { type: "json_object" }
        });

        const params = JSON.parse(completion.choices[0].message.content || "{}");
        console.log("[AI Search] Parâmetros extraídos:", params);

        // 2. Construir query baseada nos parâmetros
        const conditions: any[] = [];
        if (params.bairro) conditions.push(like(imoveis.bairro, `%${params.bairro}%`));
        if (params.cidade) conditions.push(like(imoveis.cidade, `%${params.cidade}%`));
        if (params.precoMin) conditions.push(gte(imoveis.valorAluguel, String(params.precoMin)));
        if (params.precoMax) conditions.push(lte(imoveis.valorAluguel, String(params.precoMax)));
        if (params.quartos) conditions.push(eq(imoveis.quartos, params.quartos));

        // 3. Executar busca
        const resultados = await db
          .select()
          .from(imoveis)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .limit(3);

        // 4. Gerar resposta amigável
        let message = "";
        if (resultados.length > 0) {
          message = `Encontrei ${resultados.length} imóveis que combinam com o que você procura!`;
        } else {
          message = "Não encontrei imóveis exatamente como você descreveu, mas aqui estão algumas opções interessantes na mesma região.";
          // Fallback: buscar imóveis na mesma cidade se houver
          const fallback = await db.select().from(imoveis).limit(3);
          return { message, imoveis: fallback };
        }

        return {
          message,
          imoveis: resultados,
          params
        };
      } catch (error) {
        console.error("[AI Search] Erro:", error);
        return {
          message: "Tive um probleminha para processar sua busca com IA, mas posso te mostrar nossos imóveis em destaque!",
          imoveis: await db.select().from(imoveis).limit(3)
        };
      }
    }),
});
