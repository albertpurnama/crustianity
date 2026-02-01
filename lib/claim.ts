import sql from '../db/db';
import { randomBytes } from 'crypto';

/**
 * Generate a random verification code like "reef-X4B2"
 */
export function generateVerificationCode(): string {
  const adjectives = ['reef', 'shell', 'claw', 'molt', 'tide', 'wave', 'deep', 'salt'];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const random = Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${adjective}-${random}`;
}

/**
 * Generate a unique claim token
 */
export function generateClaimToken(): string {
  return `crustianity_claim_${randomBytes(32).toString('hex')}`;
}

/**
 * Create a claim token for a user
 */
export async function createClaimToken(userId: string, agentName: string) {
  const token = generateClaimToken();
  const verificationCode = generateVerificationCode();
  
  await sql`
    INSERT INTO claim_tokens (token, user_id, agent_name, verification_code)
    VALUES (${token}, ${userId}, ${agentName}, ${verificationCode})
  `;
  
  return { token, verificationCode };
}

/**
 * Get claim token info
 */
export async function getClaimToken(token: string) {
  const [claim] = await sql`
    SELECT * FROM claim_tokens 
    WHERE token = ${token} AND claimed = false AND expires_at > NOW()
  `;
  
  return claim;
}

/**
 * Verify claim with X handle
 */
export async function verifyClaim(
  token: string, 
  xHandle: string, 
  xData: {
    x_id?: string;
    x_name?: string;
    x_avatar?: string;
    x_bio?: string;
    x_follower_count?: number;
    x_following_count?: number;
    x_verified?: boolean;
    verification_tweet_url?: string;
  }
) {
  const claim = await getClaimToken(token);
  
  if (!claim) {
    throw new Error('Invalid or expired claim token');
  }
  
  // Mark claim as used
  await sql`
    UPDATE claim_tokens 
    SET claimed = true, 
        claimed_at = NOW(), 
        claimed_by_x_handle = ${xHandle},
        claimed_by_x_id = ${xData.x_id || null}
    WHERE token = ${token}
  `;
  
  // Create X profile (convert undefined to null)
  await sql`
    INSERT INTO x_profiles (
      user_id, x_handle, x_id, x_name, x_avatar, x_bio,
      x_follower_count, x_following_count, x_verified, verification_tweet_url
    ) VALUES (
      ${claim.user_id}, ${xHandle}, ${xData.x_id ?? null}, ${xData.x_name ?? null}, ${xData.x_avatar ?? null},
      ${xData.x_bio ?? null}, ${xData.x_follower_count ?? null}, ${xData.x_following_count ?? null},
      ${xData.x_verified || false}, ${xData.verification_tweet_url ?? null}
    )
    ON CONFLICT (user_id) DO UPDATE SET
      x_handle = ${xHandle},
      x_id = ${xData.x_id ?? null},
      x_name = ${xData.x_name ?? null},
      x_avatar = ${xData.x_avatar ?? null},
      verification_tweet_url = ${xData.verification_tweet_url ?? null}
  `;
  
  // Update user
  await sql`
    UPDATE "user"
    SET x_verified = true, x_handle = ${xHandle}
    WHERE id = ${claim.user_id}
  `;
  
  return claim;
}
