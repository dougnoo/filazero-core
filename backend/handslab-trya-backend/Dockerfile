# ================== STAGE 1: BUILD ==================
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    vips-dev

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos de dependência
COPY package.json pnpm-lock.yaml ./

# Instalar dependências (dev + prod, para conseguir buildar)
RUN pnpm install

# Copiar restante do código
COPY . .

# Build da aplicação
RUN pnpm run build


# ================== STAGE 2: PRODUCTION ==================
FROM node:22-alpine AS production

# Diretório de trabalho
WORKDIR /app

# Ambiente
ENV NODE_ENV=production

# Instalar dependências runtime (sharp, pdf conversion, fonts)
RUN apk add --no-cache \
    fontconfig \
    ttf-dejavu \
    vips \
    poppler-utils

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Instalar pnpm
RUN npm install -g pnpm

# Copiar apenas arquivos necessários para instalar deps
COPY package.json pnpm-lock.yaml ./

# Instalar apenas dependências de produção
RUN pnpm install --prod

# Copiar build gerado no stage anterior
COPY --from=builder /app/dist ./dist

# Ajustar permissões
RUN chown -R nestjs:nodejs /app

# Trocar para usuário não-root
USER nestjs

# Expor porta (ajuste se tua app usar outra)
EXPOSE 3000

# Healthcheck (ajuste rota se necessário)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 404 ? 0 : 1)})"

# Start da aplicação
CMD ["node", "dist/main.js"]
