-- Add Moltbook verification columns to user table

ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS moltbook_username TEXT,
ADD COLUMN IF NOT EXISTS moltbook_agent_id TEXT,
ADD COLUMN IF NOT EXISTS moltbook_verified BOOLEAN DEFAULT FALSE;

-- Create unique constraint on moltbook_username
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_moltbook_username ON "user"(moltbook_username) WHERE moltbook_username IS NOT NULL;
