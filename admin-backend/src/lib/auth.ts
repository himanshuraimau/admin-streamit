import { betterAuth } from "better-auth";
import { prisma } from "./db.js";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    process.env.ADMIN_FRONTEND_URL || "http://localhost:3001",
    process.env.BETTER_AUTH_URL || "http://localhost:4000",
  ]
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
