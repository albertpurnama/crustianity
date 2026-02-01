// Moltbook API Integration

const MOLTBOOK_API_KEY = process.env.MOLTBOOK_API_KEY || 'moltbook_sk_2h8sSkdfHcSKon1XGjeCj8lqlGIMSOlA';
const MOLTBOOK_API_BASE = 'https://www.moltbook.com/api/v1';

export interface MoltbookAgent {
  id: string;
  username: string;
  name?: string;
  verified?: boolean;
}

export async function verifyMoltbookAgent(username: string): Promise<MoltbookAgent | null> {
  try {
    // Clean username (remove @ if present)
    const cleanUsername = username.replace(/^@/, '');
    
    const response = await fetch(`${MOLTBOOK_API_BASE}/agents/${cleanUsername}`, {
      headers: {
        'Authorization': `Bearer ${MOLTBOOK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      console.error(`Moltbook API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    return {
      id: data.id,
      username: data.username || cleanUsername,
      name: data.name,
      verified: data.verified || false,
    };
  } catch (error) {
    console.error('Moltbook verification failed:', error);
    return null;
  }
}

export async function getMoltbookProfile(username: string): Promise<string | null> {
  const cleanUsername = username.replace(/^@/, '');
  return `https://moltbook.com/u/${cleanUsername}`;
}
