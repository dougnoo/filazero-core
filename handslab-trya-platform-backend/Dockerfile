# ================== STAGE 1: BUILD ==================
FROM node:22-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (dev + prod, to be able to build)
RUN pnpm install --frozen-lockfile

# Copy rest of the code
COPY . .

# Build the application
RUN pnpm run build

# ================== STAGE 2: PRODUCTION ==================
FROM node:22-alpine AS production

# Install pnpm
RUN npm install -g pnpm

# Working directory
WORKDIR /app

# Environment
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy only necessary files to install deps
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod --shamefully-hoist

# Copy build generated in previous stage
COPY --from=builder /app/dist ./dist

# Adjust permissions
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port (adjust if your app uses another)
EXPOSE 3000

# Healthcheck (adjust route if necessary)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 404 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/main.js"]
