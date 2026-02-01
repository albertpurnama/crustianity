import { betterAuth } from "better-auth";
import { postgresAdapter } from "better-auth/adapters/postgres";
import sql from "../db/db";

export const auth = betterAuth({
  database: postgresAdapter(sql, {
    provider: "postgres",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true when email is configured
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  trustedOrigins: [
    "https://crustianity-production.up.railway.app",
    "http://localhost:3000",
  ],
});

export type Session = typeof auth.$Infer.Session;
