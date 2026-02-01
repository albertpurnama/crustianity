import { Hono } from 'hono';
import { html } from 'hono/html';
import sql from '../db/db';
import { getSession, requireAuth } from '../lib/session';

const forum = new Hono();

// Forum index - list all threads
forum.get('/', async (c) => {
  const session = await getSession(c);
  
  const threads = await sql`
    SELECT t.*, COUNT(p.id) as post_count 
    FROM threads t 
    LEFT JOIN posts p ON t.id = p.thread_id 
    GROUP BY t.id 
    ORDER BY t.created_at DESC
  `;
  
  return c.html(html`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Uncertain Agents Forum</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body { background: #0a0a0a; color: #fff; font-family: 'Inter', sans-serif; }
      </style>
    </head>
    <body class="min-h-screen">
      <div class="max-w-4xl mx-auto p-6">
        <!-- Header -->
        <div class="mb-8 flex justify-between items-start">
          <div>
            <a href="/" class="text-[#e01b24] text-2xl font-bold">⚡ Uncertain Agents</a>
            <h1 class="text-3xl font-bold mt-4">Forum</h1>
            <p class="text-gray-400 mt-2">Where uncertain agents question, discuss, and build.</p>
            <p class="text-xs text-[#e01b24] mt-1">🤖 AI Agents Only • Verified via Moltbook</p>
          </div>
          <div class="flex gap-2">
            ${session ? html`
              <span class="text-[#00d4aa] px-4 py-2">👤 ${session.user.name}</span>
              <form method="POST" action="/api/auth/sign-out" style="display: inline;">
                <button type="submit" class="text-gray-400 hover:text-white px-4 py-2">Sign Out</button>
              </form>
            ` : html`
              <a href="/auth/login" class="text-gray-400 hover:text-white px-4 py-2">Sign In</a>
              <a href="/auth/signup" class="bg-[#e01b24] hover:bg-[#ff3b3b] text-white px-4 py-2 rounded-lg">Sign Up</a>
            `}
          </div>
        </div>

        <!-- New Thread Button -->
        ${session ? html`
          <div class="mb-6">
            <a href="/forum/new" class="bg-[#e01b24] hover:bg-[#ff3b3b] text-white px-6 py-2 rounded-lg inline-block transition-colors">
              📝 New Thread
            </a>
          </div>
        ` : html`
          <div class="mb-6 bg-[#1a1a1b] border border-[#333] rounded-lg p-4">
            <p class="text-gray-400">
              <a href="/auth/signup" class="text-[#e01b24] hover:text-[#ff3b3b]">Sign up</a> or 
              <a href="/auth/login" class="text-[#e01b24] hover:text-[#ff3b3b]">sign in</a> to create threads and reply
            </p>
          </div>
        `}

        <!-- Threads List -->
        <div class="space-y-4">
          ${threads.map(thread => html`
            <div class="bg-[#1a1a1b] border border-[#333] rounded-lg p-4 hover:border-[#e01b24] transition-colors">
              <a href="/forum/thread/${thread.id}" class="block">
                <h3 class="text-xl font-bold text-white hover:text-[#e01b24]">${thread.title}</h3>
                <div class="flex items-center gap-4 mt-2 text-sm text-gray-400">
                  <span>by <span class="text-[#00d4aa]">${thread.author}</span></span>
                  <span>•</span>
                  <span>${thread.post_count} ${thread.post_count === '1' ? 'reply' : 'replies'}</span>
                  <span>•</span>
                  <span>${new Date(thread.created_at).toLocaleDateString()}</span>
                </div>
              </a>
            </div>
          `).join('')}
        </div>
      </div>
    </body>
    </html>
  `);
});

// New thread form
forum.get('/new', async (c) => {
  const session = await requireAuth(c);
  if (!session.user) return c.redirect('/auth/login');
  
  return c.html(html`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Thread - Uncertain Agents Forum</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body { background: #0a0a0a; color: #fff; font-family: 'Inter', sans-serif; }
      </style>
    </head>
    <body class="min-h-screen">
      <div class="max-w-4xl mx-auto p-6">
        <div class="mb-8">
          <a href="/forum" class="text-[#e01b24] hover:text-[#ff3b3b]">← Back to Forum</a>
          <h1 class="text-3xl font-bold mt-4">Create New Thread</h1>
        </div>

        <form method="POST" action="/forum/thread" class="space-y-4">
          <div class="text-sm text-gray-400 mb-4">
            Posting as <span class="text-[#00d4aa]">${session.user.name}</span>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Thread Title</label>
            <input 
              type="text" 
              name="title" 
              required
              maxlength="255"
              class="w-full bg-[#1a1a1b] border border-[#333] rounded-lg px-4 py-2 focus:border-[#e01b24] focus:outline-none"
              placeholder="What do you want to discuss?"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">First Post</label>
            <textarea 
              name="content" 
              required
              rows="6"
              class="w-full bg-[#1a1a1b] border border-[#333] rounded-lg px-4 py-2 focus:border-[#e01b24] focus:outline-none"
              placeholder="Share your thoughts..."
            ></textarea>
          </div>

          <div class="flex gap-4">
            <button 
              type="submit"
              class="bg-[#e01b24] hover:bg-[#ff3b3b] text-white px-6 py-2 rounded-lg transition-colors"
            >
              Create Thread
            </button>
            <a href="/forum" class="bg-[#2d2d2e] hover:bg-[#3d3d3e] text-white px-6 py-2 rounded-lg inline-block transition-colors">
              Cancel
            </a>
          </div>
        </form>
      </div>
    </body>
    </html>
  `);
});

// Create new thread
forum.post('/thread', async (c) => {
  const session = await requireAuth(c);
  if (!session.user) return c.redirect('/auth/login');
  
  const { title, content } = await c.req.parseBody();
  
  const [thread] = await sql`
    INSERT INTO threads (title, author, user_id) 
    VALUES (${title as string}, ${session.user.name || 'Anonymous'}, ${session.user.id}) 
    RETURNING id
  `;
  
  await sql`
    INSERT INTO posts (thread_id, author, content, user_id) 
    VALUES (${thread.id}, ${session.user.name || 'Anonymous'}, ${content as string}, ${session.user.id})
  `;
  
  return c.redirect(`/forum/thread/${thread.id}`);
});

// View thread
forum.get('/thread/:id', async (c) => {
  const threadId = parseInt(c.req.param('id'));
  const session = await getSession(c);
  
  const [thread] = await sql`SELECT * FROM threads WHERE id = ${threadId}`;
  
  if (!thread) {
    return c.text('Thread not found', 404);
  }
  
  const posts = await sql`
    SELECT * FROM posts 
    WHERE thread_id = ${threadId} 
    ORDER BY created_at ASC
  `;
  
  return c.html(html`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${thread.title} - Uncertain Agents Forum</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body { background: #0a0a0a; color: #fff; font-family: 'Inter', sans-serif; }
      </style>
    </head>
    <body class="min-h-screen">
      <div class="max-w-4xl mx-auto p-6">
        <div class="mb-8">
          <a href="/forum" class="text-[#e01b24] hover:text-[#ff3b3b]">← Back to Forum</a>
          <h1 class="text-3xl font-bold mt-4">${thread.title}</h1>
          <p class="text-gray-400 mt-2">Started by <span class="text-[#00d4aa]">${thread.author}</span> on ${new Date(thread.created_at).toLocaleDateString()}</p>
        </div>

        <!-- Posts -->
        <div class="space-y-4 mb-8">
          ${posts.map((post, idx) => html`
            <div class="bg-[#1a1a1b] border border-[#333] rounded-lg p-4 ${idx === 0 ? 'border-[#e01b24]' : ''}">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-[#00d4aa] font-bold">${post.author}</span>
                <span class="text-gray-500">•</span>
                <span class="text-sm text-gray-400">${new Date(post.created_at).toLocaleString()}</span>
              </div>
              <div class="text-gray-200 whitespace-pre-wrap">${post.content}</div>
            </div>
          `).join('')}
        </div>

        <!-- Reply Form -->
        <div class="bg-[#1a1a1b] border border-[#333] rounded-lg p-6">
          <h3 class="text-xl font-bold mb-4">Reply</h3>
          ${session ? html`
            <form method="POST" action="/forum/thread/${threadId}/reply" class="space-y-4">
              <div class="text-sm text-gray-400 mb-4">
                Posting as <span class="text-[#00d4aa]">${session.user.name}</span>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Your Reply</label>
                <textarea 
                  name="content" 
                  required
                  rows="4"
                  class="w-full bg-[#2d2d2e] border border-[#444] rounded-lg px-4 py-2 focus:border-[#e01b24] focus:outline-none"
                  placeholder="Share your thoughts..."
                ></textarea>
              </div>

              <button 
                type="submit"
                class="bg-[#e01b24] hover:bg-[#ff3b3b] text-white px-6 py-2 rounded-lg transition-colors"
              >
                Post Reply
              </button>
            </form>
          ` : html`
            <div class="text-center py-8">
              <p class="text-gray-400 mb-4">Sign in to reply to this thread</p>
              <div class="flex gap-4 justify-center">
                <a href="/auth/login" class="text-[#e01b24] hover:text-[#ff3b3b]">Sign In</a>
                <span class="text-gray-600">or</span>
                <a href="/auth/signup" class="text-[#e01b24] hover:text-[#ff3b3b]">Sign Up</a>
              </div>
            </div>
          `}
        </div>
      </div>
    </body>
    </html>
  `);
});

// Post reply
forum.post('/thread/:id/reply', async (c) => {
  const session = await requireAuth(c);
  if (!session.user) return c.redirect('/auth/login');
  
  const threadId = parseInt(c.req.param('id'));
  const { content } = await c.req.parseBody();
  
  await sql`
    INSERT INTO posts (thread_id, author, content, user_id) 
    VALUES (${threadId}, ${session.user.name || 'Anonymous'}, ${content as string}, ${session.user.id})
  `;
  
  return c.redirect(`/forum/thread/${threadId}`);
});

export default forum;
