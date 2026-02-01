-- Fix BetterAuth column naming (camelCase)
-- BetterAuth expects camelCase but we have snake_case

-- Add camelCase columns
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN DEFAULT FALSE;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP DEFAULT NOW();
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT NOW();

-- Copy data from snake_case to camelCase
UPDATE "user" SET "emailVerified" = email_verified WHERE "emailVerified" IS NULL;
UPDATE "user" SET "createdAt" = created_at WHERE "createdAt" IS NULL;
UPDATE "user" SET "updatedAt" = updated_at WHERE "updatedAt" IS NULL;

-- Do the same for session table
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP;
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "userAgent" TEXT;
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP;

-- Copy session data
UPDATE "session" SET "userId" = user_id WHERE "userId" IS NULL;
UPDATE "session" SET "expiresAt" = expires_at WHERE "expiresAt" IS NULL;
UPDATE "session" SET "ipAddress" = ip_address WHERE "ipAddress" IS NULL;
UPDATE "session" SET "userAgent" = user_agent WHERE "userAgent" IS NULL;
UPDATE "session" SET "createdAt" = created_at WHERE "createdAt" IS NULL;

-- Add foreign key constraint for camelCase column
ALTER TABLE "session" DROP CONSTRAINT IF EXISTS session_userId_fkey;
ALTER TABLE "session" ADD CONSTRAINT session_userId_fkey 
  FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE;

-- Do the same for account table
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "accountId" TEXT;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "providerId" TEXT;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "accessToken" TEXT;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "refreshToken" TEXT;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "idToken" TEXT;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP;

-- Copy account data
UPDATE "account" SET "userId" = user_id WHERE "userId" IS NULL;
UPDATE "account" SET "accountId" = account_id WHERE "accountId" IS NULL;
UPDATE "account" SET "providerId" = provider_id WHERE "providerId" IS NULL;
UPDATE "account" SET "accessToken" = access_token WHERE "accessToken" IS NULL;
UPDATE "account" SET "refreshToken" = refresh_token WHERE "refreshToken" IS NULL;
UPDATE "account" SET "idToken" = id_token WHERE "idToken" IS NULL;
UPDATE "account" SET "expiresAt" = expires_at WHERE "expiresAt" IS NULL;
UPDATE "account" SET "createdAt" = created_at WHERE "createdAt" IS NULL;
UPDATE "account" SET "updatedAt" = updated_at WHERE "updatedAt" IS NULL;

-- Add foreign key
ALTER TABLE "account" DROP CONSTRAINT IF EXISTS account_userId_fkey;
ALTER TABLE "account" ADD CONSTRAINT account_userId_fkey 
  FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE;

-- Verification table
ALTER TABLE "verification" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP;
ALTER TABLE "verification" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP;

UPDATE "verification" SET "expiresAt" = expires_at WHERE "expiresAt" IS NULL;
UPDATE "verification" SET "createdAt" = created_at WHERE "createdAt" IS NULL;
