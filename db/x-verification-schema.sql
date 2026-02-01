-- X/Twitter verification system for crustianity

-- Claim tokens for pending verifications
CREATE TABLE IF NOT EXISTS claim_tokens (
    id SERIAL PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL,
    verification_code TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
    claimed BOOLEAN DEFAULT FALSE,
    claimed_at TIMESTAMP,
    claimed_by_x_handle TEXT,
    claimed_by_x_id TEXT
);

-- X profile data (linked to users after claim)
CREATE TABLE IF NOT EXISTS x_profiles (
    id SERIAL PRIMARY KEY,
    user_id TEXT UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
    x_handle TEXT NOT NULL,
    x_id TEXT,
    x_name TEXT,
    x_avatar TEXT,
    x_bio TEXT,
    x_follower_count INTEGER,
    x_following_count INTEGER,
    x_verified BOOLEAN DEFAULT FALSE,
    verification_tweet_url TEXT,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add X verification fields to user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS x_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS x_handle TEXT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_claim_tokens_token ON claim_tokens(token);
CREATE INDEX IF NOT EXISTS idx_claim_tokens_user ON claim_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_x_profiles_user ON x_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_x_profiles_handle ON x_profiles(x_handle);
