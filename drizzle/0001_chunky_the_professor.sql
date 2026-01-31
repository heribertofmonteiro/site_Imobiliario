CREATE TABLE `caracteristicas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`icone` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `caracteristicas_id` PRIMARY KEY(`id`),
	CONSTRAINT `caracteristicas_nome_unique` UNIQUE(`nome`),
	CONSTRAINT `caracteristicas_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `contatos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`imovel_id` int,
	`nome` varchar(100) NOT NULL,
	`email` varchar(100) NOT NULL,
	`telefone` varchar(20) NOT NULL,
	`mensagem` text,
	`status_contato` enum('novo','respondido','descartado') NOT NULL DEFAULT 'novo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contatos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favoritos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`imovel_id` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favoritos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `imagens_imovel` (
	`id` int AUTO_INCREMENT NOT NULL,
	`imovel_id` int NOT NULL,
	`url` varchar(255) NOT NULL,
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `imagens_imovel_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `imoveis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text NOT NULL,
	`valor_aluguel` decimal(10,2) NOT NULL,
	`tipo_imovel_id` int NOT NULL,
	`endereco` varchar(255) NOT NULL,
	`bairro` varchar(100) NOT NULL,
	`cidade` varchar(100) NOT NULL,
	`estado` varchar(2) NOT NULL,
	`cep` varchar(10),
	`latitude` decimal(10,8) NOT NULL,
	`longitude` decimal(11,8) NOT NULL,
	`status` enum('disponivel','alugado','promocao','imperdivel') NOT NULL DEFAULT 'disponivel',
	`desconto` int DEFAULT 0,
	`data_publicacao` timestamp NOT NULL DEFAULT (now()),
	`seo_slug` varchar(255) NOT NULL,
	`imagem_principal` varchar(255),
	`quartos` int,
	`banheiros` int,
	`area_total` int,
	`ativo` boolean NOT NULL DEFAULT true,
	`visualizacoes` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `imoveis_id` PRIMARY KEY(`id`),
	CONSTRAINT `imoveis_seo_slug_unique` UNIQUE(`seo_slug`)
);
--> statement-breakpoint
CREATE TABLE `imovel_caracteristica` (
	`id` int AUTO_INCREMENT NOT NULL,
	`imovel_id` int NOT NULL,
	`caracteristica_id` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `imovel_caracteristica_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tipos_imoveis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`descricao` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tipos_imoveis_id` PRIMARY KEY(`id`),
	CONSTRAINT `tipos_imoveis_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `imovel_contato_idx` ON `contatos` (`imovel_id`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `contatos` (`email`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `favoritos` (`user_id`);--> statement-breakpoint
CREATE INDEX `imovel_id_idx` ON `favoritos` (`imovel_id`);--> statement-breakpoint
CREATE INDEX `imovel_id_idx` ON `imagens_imovel` (`imovel_id`);--> statement-breakpoint
CREATE INDEX `tipo_imovel_idx` ON `imoveis` (`tipo_imovel_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `imoveis` (`status`);--> statement-breakpoint
CREATE INDEX `cidade_idx` ON `imoveis` (`cidade`);--> statement-breakpoint
CREATE INDEX `lat_lng_idx` ON `imoveis` (`latitude`,`longitude`);--> statement-breakpoint
CREATE INDEX `data_publicacao_idx` ON `imoveis` (`data_publicacao`);--> statement-breakpoint
CREATE INDEX `imovel_idx` ON `imovel_caracteristica` (`imovel_id`);--> statement-breakpoint
CREATE INDEX `caracteristica_idx` ON `imovel_caracteristica` (`caracteristica_id`);