import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Tabela de usuários - Autenticação e perfil
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de tipos de imóveis (Apartamento, Casa, Kitnet, etc.)
 */
export const tiposImoveis = mysqlTable("tipos_imoveis", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  descricao: text("descricao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TipoImovel = typeof tiposImoveis.$inferSelect;
export type InsertTipoImovel = typeof tiposImoveis.$inferInsert;

/**
 * Tabela de características (Piscina, Pet Friendly, Mobiliado, etc.)
 */
export const caracteristicas = mysqlTable("caracteristicas", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  icone: varchar("icone", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Caracteristica = typeof caracteristicas.$inferSelect;
export type InsertCaracteristica = typeof caracteristicas.$inferInsert;

/**
 * Tabela principal de imóveis
 * Suporta geolocalização com latitude/longitude
 * Status: disponivel, alugado, promocao, imperdivel
 */
export const imoveis = mysqlTable(
  "imoveis",
  {
    id: int("id").autoincrement().primaryKey(),
    titulo: varchar("titulo", { length: 255 }).notNull(),
    descricao: text("descricao").notNull(),
    valorAluguel: decimal("valor_aluguel", { precision: 10, scale: 2 }).notNull(),
    tipoImovelId: int("tipo_imovel_id").notNull(),
    endereco: varchar("endereco", { length: 255 }).notNull(),
    bairro: varchar("bairro", { length: 100 }).notNull(),
    cidade: varchar("cidade", { length: 100 }).notNull(),
    estado: varchar("estado", { length: 2 }).notNull(),
    cep: varchar("cep", { length: 10 }),
    latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
    longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
    status: mysqlEnum("status", ["disponivel", "alugado", "promocao", "imperdivel"]).default("disponivel").notNull(),
    desconto: int("desconto").default(0), // Percentual de desconto para promoções
    dataPublicacao: timestamp("data_publicacao").defaultNow().notNull(),
    seoSlug: varchar("seo_slug", { length: 255 }).notNull().unique(),
    imagemPrincipal: varchar("imagem_principal", { length: 255 }),
    quartos: int("quartos"),
    banheiros: int("banheiros"),
    areaTotal: int("area_total"), // em m²
    tipologia: varchar("tipologia", { length: 20 }), // ex: 1K, 1LDK, 2LDK
    ativo: boolean("ativo").default(true).notNull(),
    visualizacoes: int("visualizacoes").default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    tipoImovelIdx: index("tipo_imovel_idx").on(table.tipoImovelId),
    statusIdx: index("status_idx").on(table.status),
    cidadeIdx: index("cidade_idx").on(table.cidade),
    latLngIdx: index("lat_lng_idx").on(table.latitude, table.longitude),
    dataPublicacaoIdx: index("data_publicacao_idx").on(table.dataPublicacao),
  })
);

export type Imovel = typeof imoveis.$inferSelect;
export type InsertImovel = typeof imoveis.$inferInsert;

/**
 * Tabela pivô: Relacionamento N:N entre imóveis e características
 */
export const imovelCaracteristica = mysqlTable(
  "imovel_caracteristica",
  {
    id: int("id").autoincrement().primaryKey(),
    imovelId: int("imovel_id").notNull(),
    caracteristicaId: int("caracteristica_id").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    imovelIdx: index("imovel_idx").on(table.imovelId),
    caracteristicaIdx: index("caracteristica_idx").on(table.caracteristicaId),
  })
);

export type ImovelCaracteristica = typeof imovelCaracteristica.$inferSelect;
export type InsertImovelCaracteristica = typeof imovelCaracteristica.$inferInsert;

/**
 * Tabela de imagens de imóveis
 */
export const imagensImovel = mysqlTable(
  "imagens_imovel",
  {
    id: int("id").autoincrement().primaryKey(),
    imovelId: int("imovel_id").notNull(),
    url: varchar("url", { length: 255 }).notNull(),
    ordem: int("ordem").default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    imovelIdx: index("imovel_id_idx").on(table.imovelId),
  })
);

export type ImagemImovel = typeof imagensImovel.$inferSelect;
export type InsertImagemImovel = typeof imagensImovel.$inferInsert;

/**
 * Tabela de contatos/leads
 */
export const contatos = mysqlTable(
  "contatos",
  {
    id: int("id").autoincrement().primaryKey(),
    imovelId: int("imovel_id"),
    nome: varchar("nome", { length: 100 }).notNull(),
    email: varchar("email", { length: 100 }).notNull(),
    telefone: varchar("telefone", { length: 20 }).notNull(),
    mensagem: text("mensagem"),
    statusContato: mysqlEnum("status_contato", ["novo", "respondido", "descartado"]).default("novo").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    imovelIdx: index("imovel_contato_idx").on(table.imovelId),
    emailIdx: index("email_idx").on(table.email),
  })
);

export type Contato = typeof contatos.$inferSelect;
export type InsertContato = typeof contatos.$inferInsert;

/**
 * Tabela de favoritos do usuário
 */
export const favoritos = mysqlTable(
  "favoritos",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id").notNull(),
    imovelId: int("imovel_id").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("user_id_idx").on(table.userId),
    imovelIdx: index("imovel_id_idx").on(table.imovelId),
  })
);

export type Favorito = typeof favoritos.$inferSelect;
export type InsertFavorito = typeof favoritos.$inferInsert;

/**
 * Tabela de histórico de acesso/busca
 */
export const historicoAcesso = mysqlTable(
  "historico_acesso",
  {
    id: int("id").autoincrement().primaryKey(),
    imovelId: int("imovel_id"),
    tipo: mysqlEnum("tipo", ["visualizacao", "busca", "contato"]).notNull(),
    parametrosBusca: text("parametros_busca"),
    dataAcesso: timestamp("data_acesso").defaultNow().notNull(),
  },
  (table) => ({
    imovelIdx: index("imovel_id_idx").on(table.imovelId),
    tipoIdx: index("tipo_idx").on(table.tipo),
  })
);

export type HistoricoAcesso = typeof historicoAcesso.$inferSelect;
export type InsertHistoricoAcesso = typeof historicoAcesso.$inferInsert;

/**
 * Tabela de avaliações e comentários
 */
export const avaliacoes = mysqlTable(
  "avaliacoes",
  {
    id: int("id").autoincrement().primaryKey(),
    imovelId: int("imovel_id").notNull(),
    userId: int("user_id").notNull(),
    rating: int("rating").notNull(), // 1 a 5
    titulo: varchar("titulo", { length: 200 }).notNull(),
    comentario: text("comentario").notNull(),
    dataAvaliacao: timestamp("data_avaliacao").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    imovelIdx: index("imovel_id_idx").on(table.imovelId),
    userIdx: index("user_id_idx").on(table.userId),
    ratingIdx: index("rating_idx").on(table.rating),
  })
);

export type Avaliacao = typeof avaliacoes.$inferSelect;
export type InsertAvaliacao = typeof avaliacoes.$inferInsert;

/**
 * Tabela de configurações de notificações (WhatsApp/Telegram)
 */
export const configuracoesNotificacoes = mysqlTable(
  "configuracoes_notificacoes",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id").notNull(),
    whatsappNumero: varchar("whatsapp_numero", { length: 20 }),
    whatsappAtivo: boolean("whatsapp_ativo").default(false).notNull(),
    telegramChatId: varchar("telegram_chat_id", { length: 100 }),
    telegramAtivo: boolean("telegram_ativo").default(false).notNull(),
    emailNotificacoes: boolean("email_notificacoes").default(true).notNull(),
    notificacoesNovoImovel: boolean("notificacoes_novo_imovel").default(true).notNull(),
    notificacoesOfertasImperdivel: boolean("notificacoes_ofertas_imperdivel").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdx: index("user_id_idx").on(table.userId),
  })
);

export type ConfiguracaoNotificacoes = typeof configuracoesNotificacoes.$inferSelect;
export type InsertConfiguracaoNotificacoes = typeof configuracoesNotificacoes.$inferInsert;
