# Imagem base
FROM node:20-alpine

# Configurações de ambiente
ENV NODE_ENV=production

# Diretório de trabalho
WORKDIR /app

# Instala o pnpm globalmente
RUN npm install -g pnpm@8.15.1

# Copia os arquivos necessários
COPY package.json pnpm-lock.yaml ./

# Instala apenas as dependências de produção
RUN pnpm install --frozen-lockfile --prod

# Copia toda a pasta dist
COPY dist/ ./

# Expõe a porta 3000
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "index.js"]
