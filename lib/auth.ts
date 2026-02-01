import { betterAuth } from "better-auth";
import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://postgres:ZLhIvyXzEoJVlvSZYJhCvLOxoWolhRKY@postgres.railway.internal:5432/railway';

export const auth = betterAuth({
  database: new Pool({
    connectionString: DATABASE_URL,
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
