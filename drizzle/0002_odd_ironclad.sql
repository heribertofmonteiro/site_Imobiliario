CREATE TABLE `avaliacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`imovel_id` int NOT NULL,
	`user_id` int NOT NULL,
	`rating` int NOT NULL,
	`titulo` varchar(200) NOT NULL,
	`comentario` text NOT NULL,
	`data_avaliacao` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `avaliacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `configuracoes_notificacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`whatsapp_numero` varchar(20),
	`whatsapp_ativo` boolean NOT NULL DEFAULT false,
	`telegram_chat_id` varchar(100),
	`telegram_ativo` boolean NOT NULL DEFAULT false,
	`email_notificacoes` boolean NOT NULL DEFAULT true,
	`notificacoes_novo_imovel` boolean NOT NULL DEFAULT true,
	`notificacoes_ofertas_imperdivel` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `configuracoes_notificacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `historico_acesso` (
	`id` int AUTO_INCREMENT NOT NULL,
	`imovel_id` int,
	`tipo` enum('visualizacao','busca','contato') NOT NULL,
	`parametros_busca` text,
	`data_acesso` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `historico_acesso_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `imovel_id_idx` ON `avaliacoes` (`imovel_id`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `avaliacoes` (`user_id`);--> statement-breakpoint
CREATE INDEX `rating_idx` ON `avaliacoes` (`rating`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `configuracoes_notificacoes` (`user_id`);--> statement-breakpoint
CREATE INDEX `imovel_id_idx` ON `historico_acesso` (`imovel_id`);--> statement-breakpoint
CREATE INDEX `tipo_idx` ON `historico_acesso` (`tipo`);