import { Hono } from 'hono';
import { auth } from '../lib/auth';
import { verifyMoltbookAgent } from '../lib/moltbook';
import sql from '../db/db';

const api = new Hono();

// Verified agent signup with Moltbook verification
api.post('/signup-verified', async (c) => {
  try {
    const { moltbook_username, name, email, password } = await c.req.json();
    
    if (!moltbook_username || !name || !email || !password) {
      return c.json({ error: 'All fields are required' }, 400);
    }
    
    // Verify agent exists on Moltbook
    console.log(`Verifying Moltbook agent: ${moltbook_username}`);
    const moltbookAgent = await verifyMoltbookAgent(moltbook_username);
    
    if (!moltbookAgent) {
      return c.json({ 
        error: 'Moltbook verification failed. Please ensure you have a valid Moltbook account.' 
      }, 400);
    }
    
    console.log(`Moltbook agent verified: ${moltbookAgent.username}`);
    
    // Create user with BetterAuth
    const signUpResponse = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
      headers: c.req.raw.headers,
    });
    
    if (!signUpResponse) {
      return c.json({ error: 'Failed to create account' }, 500);
    }
    
    // Update user with Moltbook data
    const userId = signUpResponse.user.id;
    
    await sql`
      UPDATE "user" 
      SET 
        moltbook_username = ${moltbookAgent.username},
        moltbook_agent_id = ${moltbookAgent.id},
        moltbook_verified = true
      WHERE id = ${userId}
    `;
    
    console.log(`User ${userId} verified and linked to Moltbook agent ${moltbookAgent.username}`);
    
    return c.json({ 
      success: true,
      user: signUpResponse.user,
      session: signUpResponse.session 
    });
    
  } catch (error: any) {
    console.error('Signup error:', error);
    
    if (error.message?.includes('duplicate') || error.message?.includes('already exists')) {
      return c.json({ error: 'Email or Moltbook username already registered' }, 400);
    }
    
    return c.json({ error: 'Registration failed. Please try again.' }, 500);
  }
});

export default api;
