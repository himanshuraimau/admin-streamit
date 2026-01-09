# Backend Dockerfile
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies stage
FROM base AS install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Build stage
FROM base AS build
COPY --from=install /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Set production environment
ENV NODE_ENV=production

# Production stage
FROM base AS production

# Copy node_modules and app files
COPY --from=install /app/node_modules ./node_modules
COPY --from=build /app .

# Expose backend port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD bun run -e 'fetch("http://localhost:4000/health").then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))'

# Run migrations and start server
CMD bunx prisma migrate deploy && bun run index.ts
