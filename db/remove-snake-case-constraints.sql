-- Remove NOT NULL constraints from snake_case columns
-- since we're now using camelCase columns with BetterAuth

-- Account table - make user_id nullable
ALTER TABLE "account" ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE "account" ALTER COLUMN account_id DROP NOT NULL;
ALTER TABLE "account" ALTER COLUMN provider_id DROP NOT NULL;

-- Session table - make user_id nullable
ALTER TABLE "session" ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE "session" ALTER COLUMN expires_at DROP NOT NULL;

-- User table - make email_verified nullable (but keep email NOT NULL)
ALTER TABLE "user" ALTER COLUMN email_verified DROP NOT NULL;
ALTER TABLE "user" ALTER COLUMN created_at DROP NOT NULL;
ALTER TABLE "user" ALTER COLUMN updated_at DROP NOT NULL;

-- Verification table
ALTER TABLE "verification" ALTER COLUMN expires_at DROP NOT NULL;
ALTER TABLE "verification" ALTER COLUMN created_at DROP NOT NULL;
