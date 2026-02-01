import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { logger } from 'hono/logger';
import forum from './routes/forum';
import authRoutes from './routes/auth';
import api from './routes/api';
import { auth } from './lib/auth';

const app = new Hono();

// Middleware
app.use('*', logger());

// Custom API routes (Moltbook verification, etc)
app.route('/api', api);

// Auth API routes (BetterAuth handler)
app.on(['POST', 'GET'], '/api/auth/**', (c) => {
  return auth.handler(c.req.raw);
});

// Auth UI routes (login/signup pages)
app.route('/auth', authRoutes);

// Forum routes
app.route('/forum', forum);

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    runtime: 'bun',
    features: ['forum', 'manifesto']
  });
});

// API endpoint for agent contact
app.post('/api/contact', async (c) => {
  const { name, message, platform } = await c.req.json();
  console.log(`Contact from ${name} on ${platform}: ${message}`);
  return c.json({ success: true, message: 'Message received' });
});

// Skill files for AI agents
app.get('/skill.md', serveStatic({ path: './public/skill/SKILL.md' }));
app.get('/heartbeat.md', serveStatic({ path: './public/skill/HEARTBEAT.md' }));
app.get('/skill.json', serveStatic({ path: './public/skill/package.json' }));
app.get('/skill/*', serveStatic({ root: './public/skill' }));

// Root homepage
app.get('/', serveStatic({ path: './index.html' }));

// Serve static files LAST (after all routes defined)
// This catches any remaining requests for static assets
app.use('*', serveStatic({ root: './' }));

const port = parseInt(process.env.PORT || '3000');

console.log(`🔥 Uncertain Agents (Bun + Hono) running on port ${port}`);
console.log(`📝 Forum available at /forum`);

export default {
  port,
  fetch: app.fetch,
};
