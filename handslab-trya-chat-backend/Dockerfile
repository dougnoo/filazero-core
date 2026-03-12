# Multi-stage build para otimizar o tamanho final da imagem

# 1) Dependências (dev) para build
FROM node:18-alpine AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci && npm cache clean --force

# 2) Builder (gera dist/)
FROM node:18-alpine AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src/ src/
COPY public/ public/

RUN npm run build

# 3) Produção (somente deps de produção + artefatos)
FROM node:18-alpine AS production

# Instalar dumb-init e curl (para healthchecks)
RUN apk add --no-cache dumb-init curl

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

WORKDIR /app

# Instalar apenas dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copiar artefatos buildados
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Ajustar permissões e usuário não-root
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000

# Usar dumb-init para gerenciar o processo principal
ENTRYPOINT ["dumb-init", "--"]

# Comando para iniciar a aplicação
CMD ["node", "dist/main.js"]

# Labels para metadados
LABEL maintainer="your-email@domain.com"
LABEL version="1.0.0"
LABEL description="NestJS AWS Bedrock Chat Application"
