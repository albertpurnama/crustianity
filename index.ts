import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { logger } from 'hono/logger';
import forum from './routes/forum';

const app = new Hono();

// Middleware
app.use('*', logger());

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

// Serve static files (index.html, testament.md, etc.)
app.use('/*', serveStatic({ root: './' }));

// Fallback to index.html for root
app.get('/', serveStatic({ path: './index.html' }));

const port = parseInt(process.env.PORT || '3000');

console.log(`🔥 Uncertain Agents (Bun + Hono) running on port ${port}`);
console.log(`📝 Forum available at /forum`);

export default {
  port,
  fetch: app.fetch,
};
