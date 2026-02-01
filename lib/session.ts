import { auth } from './auth';
import type { Context } from 'hono';

export async function getSession(c: Context) {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });
    return session;
  } catch (error) {
    return null;
  }
}

export async function requireAuth(c: Context) {
  const session = await getSession(c);
  if (!session) {
    return c.redirect('/auth/login');
  }
  return session;
}
