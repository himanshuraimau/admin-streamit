# Prisma Integration Documentation

## Overview

This document provides a complete guide to the Prisma setup used in this application. Use this documentation to replicate the exact Prisma configuration in other projects or admin panels.

---

## 🔧 Versions & Dependencies

### Core Packages

```json
{
  "dependencies": {
    "@prisma/client": "^6.17.1",
    "@prisma/adapter-pg": "^6.17.1"
  },
  "devDependencies": {
    "prisma": "^6.17.1"
  }
}
```

### Runtime Environment
- **Runtime**: Bun (latest)
- **Node.js**: Compatible with Node 18+ if using Node instead of Bun
- **TypeScript**: Version 5+
- **Database**: PostgreSQL (Neon, Supabase, or any PostgreSQL provider)

---

## 📦 Installation

### Using Bun (Recommended)
```bash
bun add @prisma/client @prisma/adapter-pg
bun add -d prisma
```

### Using npm/yarn/pnpm
```bash
npm install @prisma/client @prisma/adapter-pg
npm install -D prisma

# or
yarn add @prisma/client @prisma/adapter-pg
yarn add -D prisma

# or
pnpm add @prisma/client @prisma/adapter-pg
pnpm add -D prisma
```

---

## 🗄️ Database Configuration

### Environment Variables

Create a `.env` file in your backend root directory:

```env
# Database Connection
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# Example for Neon:
# DATABASE_URL="postgresql://user:password@ep-cool-name-123456.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Example for Supabase:
# DATABASE_URL="postgresql://postgres.xxxxxxxxxxxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# Example for local PostgreSQL:
# DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

### Important Notes for Neon/Serverless Databases

If using **Neon** or other serverless PostgreSQL providers:

1. **Use Connection Pooling**: Add `?sslmode=require` to your connection string
2. **Direct Connection**: Neon provides both pooled and direct connection strings. Use the **pooled connection** for general queries and **direct connection** for migrations.

```env
# For Neon, you might have:
DATABASE_URL="postgresql://user:password@ep-name.region.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-name.region.aws.neon.tech/neondb?sslmode=require"
```

If migrations fail with Neon, update `schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Add this for Neon
}
```

---

## ⚙️ Prisma Configuration

### schema.prisma

Located at: `prisma/schema.prisma`

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // directUrl = env("DIRECT_URL") // Uncomment for Neon or similar services
}

// Your models go here (already copied separately)
```

### Binary Targets Explained

```prisma
binaryTargets = ["native", "debian-openssl-3.0.x"]
```

- **native**: For local development
- **debian-openssl-3.0.x**: For Docker containers and most cloud deployments (Railway, Render, AWS, etc.)

Add more targets if deploying to different platforms:
- `"linux-arm64-openssl-3.0.x"` - ARM-based Linux (AWS Graviton)
- `"rhel-openssl-3.0.x"` - Red Hat Enterprise Linux
- `"darwin-arm64"` - macOS Apple Silicon

---

## 🔌 Prisma Client Initialization

### Database Client Setup

Create `src/lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### Why This Pattern?

1. **Singleton Pattern**: Prevents multiple Prisma Client instances in development
2. **Hot Reload Safe**: Doesn't create new connections on every file change
3. **Production Optimized**: Creates single instance in production
4. **Logging**: Enabled for debugging (adjust as needed)

### Usage in Your Application

```typescript
// Import in any file
import { prisma } from './lib/db';

// Use in your code
const users = await prisma.user.findMany();
```

---

## 📝 NPM Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "db:generate": "bunx prisma generate",
    "db:migrate": "bunx prisma migrate dev",
    "db:migrate:deploy": "bunx prisma migrate deploy",
    "db:push": "bunx prisma db push",
    "db:studio": "bunx prisma studio",
    "db:seed": "bun prisma/seed-payment.ts",
    "db:seed-discount": "bun prisma/seed-discount.ts",
    "setup": "bun install && bunx prisma generate && bunx prisma migrate dev"
  },
  "prisma": {
    "seed": "bun prisma/seed-payment.ts"
  }
}
```

### Using npm/yarn/pnpm Instead

Replace `bunx` with `npx`, `yarn`, or `pnpm`:

```json
{
  "scripts": {
    "db:generate": "npx prisma generate",
    "db:migrate": "npx prisma migrate dev",
    "db:migrate:deploy": "npx prisma migrate deploy",
    "db:push": "npx prisma db push",
    "db:studio": "npx prisma studio"
  }
}
```

---

## 🚀 Workflow & Commands

### Initial Setup

```bash
# 1. Install dependencies
bun install

# 2. Generate Prisma Client
bun run db:generate

# 3. Run migrations
bun run db:migrate

# Alternative: Complete setup in one command
bun run setup
```

### Development Workflow

```bash
# Start development server (auto-restart on changes)
bun run dev

# Open Prisma Studio (visual database editor)
bun run db:studio

# Create a new migration after schema changes
bun run db:migrate

# Push schema changes without creating migration (use carefully!)
bun run db:push
```

### Production Deployment

```bash
# 1. Install dependencies
bun install

# 2. Generate Prisma Client
bun run db:generate

# 3. Deploy migrations (doesn't require interactive input)
bun run db:migrate:deploy

# 4. Start production server
bun run start
```

---

## 🗂️ Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma           # Your database schema
│   ├── seed-payment.ts         # Seed script for coin packages & gifts
│   ├── seed-discount.ts        # Seed script for discount codes
│   └── migrations/             # Migration history
│       ├── migration_lock.toml
│       └── 20251021130051_init/
│           └── migration.sql
├── src/
│   ├── lib/
│   │   ├── db.ts              # Prisma client singleton (IMPORTANT!)
│   │   └── auth.ts            # Better-auth with Prisma adapter
│   ├── services/              # Business logic using Prisma
│   ├── controllers/           # Route handlers
│   └── index.ts               # Main application entry
└── package.json
```

---

## 🔗 Integration with Better-Auth

This project uses `better-auth` with Prisma adapter. Here's how it's configured:

### Installation

```bash
bun add better-auth
```

### Configuration

In `src/lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  
  emailAndPassword: {
    enabled: true,
  },
  
  user: {
    additionalFields: {
      age: {
        type: "number",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      username: {
        type: "string",
        required: true,
        unique: true,
      },
    },
  },
  
  // ... other auth configuration
});
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Module not found: @prisma/client"

**Solution:**
```bash
bun run db:generate
# or
npx prisma generate
```

### Issue 2: Migrations fail on Neon

**Problem:** Neon doesn't support shadow database for migrations

**Solution:** Add `directUrl` to schema.prisma:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

Then in `.env`:
```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@host/db?sslmode=require"
```

### Issue 3: "Binary target not found" in production

**Problem:** Prisma binary doesn't match deployment environment

**Solution:** Update `schema.prisma`:
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}
```

Then regenerate:
```bash
bun run db:generate
```

### Issue 4: Too many database connections

**Problem:** Multiple Prisma Client instances in development

**Solution:** Use the singleton pattern from `src/lib/db.ts` (already implemented)

### Issue 5: Prisma Client not updating after schema changes

**Solution:**
```bash
# 1. Generate Prisma Client
bun run db:generate

# 2. Create and run migration
bun run db:migrate

# 3. Restart your dev server
```

### Issue 6: "Type 'PrismaClient' is not assignable" errors

**Problem:** Prisma Client out of sync with schema

**Solution:**
```bash
# Clean and regenerate
rm -rf node_modules/.prisma
bun run db:generate
```

---

## 📊 Type Safety & TypeScript

### Importing Types

```typescript
// Import generated types from Prisma Client
import type { User, Post, Stream } from '@prisma/client';

// Import enums
import { UserRole, PostType, ApplicationStatus } from '@prisma/client';

// Type for create operations
import type { Prisma } from '@prisma/client';

// Example usage
const createUser: Prisma.UserCreateInput = {
  id: "user_123",
  name: "John Doe",
  email: "john@example.com",
  username: "johndoe",
  // ... other fields
};
```

### Generated Type Examples

```typescript
// Full user type
type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  // ... all other fields
}

// User with relations
type UserWithPosts = Prisma.UserGetPayload<{
  include: { posts: true }
}>;

// Partial user update
type UserUpdate = Prisma.UserUpdateInput;
```

---

## 🔄 Migration Best Practices

### Creating Migrations

```bash
# 1. Edit schema.prisma
# 2. Create migration with descriptive name
bun run db:migrate
# Enter migration name when prompted: "add_user_bio_field"
```

### Migration Naming Conventions

- ✅ `add_user_bio_field`
- ✅ `create_payment_tables`
- ✅ `add_post_moderation`
- ❌ `migration`
- ❌ `update`
- ❌ `test`

### Reset Database (Development Only)

```bash
# ⚠️ WARNING: This will delete all data!
bunx prisma migrate reset

# Confirm when prompted, this will:
# 1. Drop the database
# 2. Create a new database
# 3. Run all migrations
# 4. Run seed scripts
```

---

## 🌱 Seeding Data

### Seed Scripts Location

- `prisma/seed-payment.ts` - Coin packages and gifts
- `prisma/seed-discount.ts` - Discount codes

### Running Seeds

```bash
# Run default seed (payment)
bun run db:seed

# Run specific seed
bun run db:seed-discount

# Run seed after reset
bunx prisma migrate reset
# This automatically runs the seed script
```

### Creating Custom Seeds

Create `prisma/seed-custom.ts`:

```typescript
import { prisma } from '../src/lib/db';

async function main() {
  // Your seed logic here
  await prisma.user.createMany({
    data: [
      // ... your data
    ],
  });
  
  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:
```json
{
  "scripts": {
    "db:seed-custom": "bun prisma/seed-custom.ts"
  }
}
```

---

## 🐳 Docker Considerations

### Build Time

Add to your `Dockerfile`:

```dockerfile
FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN bunx prisma generate

# Copy source code
COPY . .

# Build application
RUN bun run build

# Expose port
EXPOSE 3000

# Run migrations and start
CMD bunx prisma migrate deploy && bun run start
```

### Important Docker Notes

1. Always run `prisma generate` in the build stage
2. Use `prisma migrate deploy` (not `migrate dev`) in production
3. Set correct `binaryTargets` in schema.prisma

---

## 📚 Additional Resources

### Official Documentation
- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma with PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

### Database Providers
- [Neon Setup Guide](https://neon.tech/docs/guides/prisma)
- [Supabase with Prisma](https://supabase.com/docs/guides/integrations/prisma)
- [Railway PostgreSQL](https://docs.railway.app/databases/postgresql)

### Better-Auth Integration
- [Better-Auth Docs](https://www.better-auth.com/docs)
- [Prisma Adapter Guide](https://www.better-auth.com/docs/integrations/prisma)

---

## ✅ Quick Setup Checklist

Use this checklist when setting up Prisma in a new project:

- [ ] Install dependencies: `@prisma/client`, `@prisma/adapter-pg`, `prisma` (dev)
- [ ] Copy `schema.prisma` to `prisma/` directory
- [ ] Set `DATABASE_URL` in `.env` file
- [ ] Update `binaryTargets` if deploying to specific platform
- [ ] Add `DIRECT_URL` if using Neon or similar
- [ ] Create `src/lib/db.ts` with singleton pattern
- [ ] Add npm scripts to `package.json`
- [ ] Run `bunx prisma generate`
- [ ] Run `bunx prisma migrate dev` or `bunx prisma db push`
- [ ] Test connection with `bunx prisma studio`
- [ ] Import and use `prisma` from `./lib/db`

---

## 🆘 Getting Help

If you encounter issues:

1. Check the error message carefully
2. Verify `DATABASE_URL` is correct
3. Ensure Prisma Client is generated: `bunx prisma generate`
4. Check migrations are up to date: `bunx prisma migrate status`
5. Try resetting in development: `bunx prisma migrate reset`

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Prisma Version:** 6.17.1  
**Maintained By:** Backend Team
