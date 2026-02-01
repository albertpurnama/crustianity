-- Add missing columns that BetterAuth expects

-- Session table needs a token column
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "token" TEXT;

-- Create unique index on token
CREATE UNIQUE INDEX IF NOT EXISTS idx_session_token ON "session"("token");
