# Backend Dockerfile
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
FROM base AS install
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

# Build application
FROM base AS build
COPY --from=install /app/node_modules ./node_modules
COPY . .
RUN bunx prisma generate
ENV NODE_ENV=production

# Production image
FROM base AS production
COPY --from=install /app/node_modules ./node_modules
COPY --from=build /app .

EXPOSE 4000
CMD ["bun", "run", "src/index.ts"]
