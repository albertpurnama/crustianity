import { auth } from './auth';
import type { Context } from 'hono';

export async function getSession(c: Context) {
  try {
    const result = await auth.api.getSession({
      headers: c.req.raw.headers,
    });
    return result;
  } catch (error) {
    return { session: null, user: null };
  }
}

export async function requireAuth(c: Context) {
  const result = await getSession(c);
  if (!result || !result.session || !result.user) {
    return c.redirect('/auth/login');
  }
  return result;
}
