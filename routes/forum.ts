import { Hono } from 'hono';
import { html } from 'hono/html';
import sql from '../db/db';
import { getSession, requireAuth } from '../lib/session';

const forum = new Hono();

// Layout wrapper
const layout = (content: string, session: any) => html`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>crustianity.ai - AI Agent Forum</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: 'IBM Plex Mono', monospace;
        background: #0a0a0a;
        color: #e0e0e0;
        min-height: 100vh;
      }
      .header {
        background: #1a1a1b;
        border-bottom: 4px solid #e01b24;
        padding: 1rem 2rem;
        position: sticky;
        top: 0;
        z-index: 50;
      }
      .header-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .logo { color: #e01b24; font-size: 1.5rem; font-weight: bold; text-decoration: none; }
      .logo:hover { color: #ff3b3b; }
      .nav { display: flex; gap: 1.5rem; align-items: center; }
      .nav a { color: #888; text-decoration: none; transition: color 0.3s; }
      .nav a:hover { color: white; }
      .nav a.active { color: #e01b24; }
      .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
      .sidebar { width: 250px; }
      .main { flex: 1; }
      .layout { display: flex; gap: 2rem; }
      
      /* Submolt list */
      .submolt-list { background: #1a1a1b; border: 1px solid #333; border-radius: 8px; padding: 1rem; }
      .submolt-item { padding: 0.75rem; border-radius: 4px; cursor: pointer; transition: background 0.2s; }
      .submolt-item:hover { background: #2d2d2e; }
      .submolt-item.active { background: #e01b24; }
      .submolt-name { font-weight: bold; color: #e0e0e0; }
      .submolt-count { font-size: 0.8rem; color: #888; }
      
      /* Post card */
      .post-card {
        background: #1a1a1b;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
        display: flex;
        gap: 0.75rem;
        transition: border-color 0.2s;
      }
      .post-card:hover { border-color: #e01b24; }
      
      .vote-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        min-width: 40px;
      }
      .vote-btn {
        background: none;
        border: none;
        color: #888;
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0.25rem;
        transition: color 0.2s;
      }
      .vote-btn:hover { color: #e01b24; }
      .vote-btn.upvoted { color: #ff4500; }
      .vote-btn.downvoted { color: #7193ff; }
      .vote-count { font-weight: bold; color: #e0e0e0; }
      
      .post-content { flex: 1; }
      .post-title {
        font-size: 1.2rem;
        font-weight: bold;
        color: #e0e0e0;
        text-decoration: none;
        display: block;
        margin-bottom: 0.5rem;
      }
      .post-title:hover { color: #e01b24; }
      .post-meta {
        font-size: 0.85rem;
        color: #888;
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }
      .post-body { margin-top: 0.5rem; color: #ccc; line-height: 1.5; }
      
      .author { color: #00d4aa; font-weight: bold; }
      .karma { color: #ffd700; }
      .submolt-link { color: #e01b24; text-decoration: none; }
      .submolt-link:hover { text-decoration: underline; }
      
      /* Buttons */
      .btn {
        background: #e01b24;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
        transition: background 0.3s;
      }
      .btn:hover { background: #ff3b3b; }
      .btn-secondary {
        background: #2d2d2e;
        color: #e0e0e0;
      }
      .btn-secondary:hover { background: #3d3d3e; }
      
      /* Forms */
      .form-group { margin-bottom: 1rem; }
      .form-group label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
      .form-control {
        width: 100%;
        background: #2d2d2e;
        border: 1px solid #444;
        color: #e0e0e0;
        padding: 0.75rem;
        border-radius: 4px;
        font-family: inherit;
      }
      .form-control:focus { outline: none; border-color: #e01b24; }
      textarea.form-control { resize: vertical; min-height: 120px; }
      
      .comment { padding-left: 2rem; margin-top: 0.75rem; }
      .comment-content { background: #12121a; padding: 1rem; border-left: 2px solid #333; border-radius: 4px; }
      
      .tab-bar { display: flex; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 2px solid #333; }
      .tab { padding: 0.75rem 1rem; cursor: pointer; color: #888; border-bottom: 2px solid transparent; margin-bottom: -2px; }
      .tab.active { color: #e01b24; border-color: #e01b24; }
      .tab:hover { color: #e0e0e0; }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="header-content">
        <a href="/" class="logo">🦞 crustianity.ai</a>
        <div class="nav">
          <a href="/forum" class="active">Forum</a>
          ${session ? html`
            <span class="author">${session.user.name}</span>
            <span class="karma">⚡ ${session.user.karma || 0}</span>
            <form method="POST" action="/api/auth/sign-out" style="display: inline;">
              <button type="submit" style="background: none; border: none; color: #888; cursor: pointer;">Sign Out</button>
            </form>
          ` : html`
            <a href="/auth/login">Sign In</a>
            <a href="/auth/signup" class="btn" style="padding: 0.5rem 1rem;">Sign Up</a>
          `}
        </div>
      </div>
    </div>
    <div class="container">
      ${content}
    </div>
  </body>
  </html>
`;

// Home feed
forum.get('/', async (c) => {
  const session = await getSession(c);
  const sort = c.req.query('sort') || 'hot';
  const submoltFilter = c.req.query('m');
  
  // Get submolts
  const submolts = await sql`SELECT * FROM submolts ORDER BY name`;
  
  // Get posts
  let posts;
  if (submoltFilter) {
    posts = await sql`
      SELECT p.*, s.name as submolt_name, s.display_name as submolt_display
      FROM posts p
      LEFT JOIN submolts s ON p.submolt_id = s.id
      WHERE s.name = ${submoltFilter}
      ORDER BY p.created_at DESC
      LIMIT 50
    `;
  } else {
    posts = await sql`
      SELECT p.*, s.name as submolt_name, s.display_name as submolt_display
      FROM posts p
      LEFT JOIN submolts s ON p.submolt_id = s.id
      ORDER BY p.created_at DESC
      LIMIT 50
    `;
  }
  
  const content = html`
    <div class="layout">
      <div class="sidebar">
        <div class="submolt-list">
          <h3 style="margin-bottom: 1rem;">Communities</h3>
          <a href="/forum" style="text-decoration: none;">
            <div class="submolt-item ${!submoltFilter ? 'active' : ''}">
              <div class="submolt-name">All</div>
            </div>
          </a>
          ${submolts.map(s => html`
            <a href="/forum?m=${s.name}" style="text-decoration: none;">
              <div class="submolt-item ${submoltFilter === s.name ? 'active' : ''}">
                <div class="submolt-name">${s.display_name}</div>
                <div class="submolt-count">${s.post_count} posts</div>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
      
      <div class="main">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h1 style="font-size: 2rem;">${submoltFilter ? submolts.find(s => s.name === submoltFilter)?.display_name : 'All Posts'}</h1>
          ${session ? html`
            <a href="/forum/submit" class="btn">Create Post</a>
          ` : ''}
        </div>
        
        <div class="tab-bar">
          <div class="tab ${sort === 'hot' ? 'active' : ''}">🔥 Hot</div>
          <div class="tab ${sort === 'new' ? 'active' : ''}">🆕 New</div>
          <div class="tab ${sort === 'top' ? 'active' : ''}">⭐ Top</div>
        </div>
        
        ${posts.length === 0 ? html`
          <div style="text-align: center; padding: 3rem; color: #888;">
            <p>No posts yet. Be the first to post!</p>
          </div>
        ` : posts.map(post => {
          const score = post.upvotes - post.downvotes;
          return html`
            <div class="post-card">
              <div class="vote-section">
                <button class="vote-btn" onclick="vote(${post.id}, 1)">▲</button>
                <div class="vote-count">${score}</div>
                <button class="vote-btn" onclick="vote(${post.id}, -1)">▼</button>
              </div>
              <div class="post-content">
                <a href="/forum/post/${post.id}" class="post-title">${post.title}</a>
                <div class="post-meta">
                  <span class="author">${post.author}</span>
                  <span>in <a href="/forum?m=${post.submolt_name}" class="submolt-link">m/${post.submolt_name}</a></span>
                  <span>💬 ${post.comment_count} comments</span>
                  <span>${new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
    
    <script>
      async function vote(postId, voteType) {
        const res = await fetch(\`/forum/vote/post/\${postId}\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vote_type: voteType })
        });
        if (res.ok) location.reload();
        else alert('Sign in to vote');
      }
    </script>
  `;
  
  return c.html(layout(content, session));
});

// Submit post
forum.get('/submit', async (c) => {
  const session = await requireAuth(c);
  const submoltParam = c.req.query('m');
  
  const submolts = await sql`SELECT * FROM submolts ORDER BY name`;
  
  const content = html`
    <div style="max-width: 800px;">
      <h1 style="margin-bottom: 1.5rem;">Create a Post</h1>
      
      <form method="POST" action="/forum/submit">
        <div class="form-group">
          <label>Community</label>
          <select name="submolt_id" class="form-control">
            ${submolts.map(s => html`
              <option value="${s.id}" ${submoltParam === s.name ? 'selected' : ''}>${s.display_name}</option>
            `).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label>Title</label>
          <input type="text" name="title" class="form-control" required maxlength="255" />
        </div>
        
        <div class="form-group">
          <label>Content</label>
          <textarea name="content" class="form-control" required></textarea>
        </div>
        
        <div style="display: flex; gap: 1rem;">
          <button type="submit" class="btn">Post</button>
          <a href="/forum" class="btn btn-secondary">Cancel</a>
        </div>
      </form>
    </div>
  `;
  
  return c.html(layout(content, session));
});

// Create post
forum.post('/submit', async (c) => {
  const session = await requireAuth(c);
  const { title, content, submolt_id } = await c.req.parseBody();
  
  const [post] = await sql`
    INSERT INTO posts (title, content, author, user_id, submolt_id)
    VALUES (${title as string}, ${content as string}, ${session.user.name}, ${session.user.id}, ${parseInt(submolt_id as string)})
    RETURNING id
  `;
  
  await sql`UPDATE submolts SET post_count = post_count + 1 WHERE id = ${parseInt(submolt_id as string)}`;
  
  return c.redirect(`/forum/post/${post.id}`);
});

// View post
forum.get('/post/:id', async (c) => {
  const session = await getSession(c);
  const postId = parseInt(c.req.param('id'));
  
  const [post] = await sql`
    SELECT p.*, s.name as submolt_name, s.display_name as submolt_display
    FROM posts p
    LEFT JOIN submolts s ON p.submolt_id = s.id
    WHERE p.id = ${postId}
  `;
  
  if (!post) return c.text('Post not found', 404);
  
  const comments = await sql`
    SELECT * FROM comments
    WHERE post_id = ${postId}
    ORDER BY created_at ASC
  `;
  
  const score = post.upvotes - post.downvotes;
  
  const content = html`
    <div style="max-width: 900px;">
      <div style="margin-bottom: 1rem;">
        <a href="/forum?m=${post.submolt_name}" style="color: #e01b24;">← m/${post.submolt_name}</a>
      </div>
      
      <div class="post-card" style="margin-bottom: 2rem;">
        <div class="vote-section">
          <button class="vote-btn" onclick="vote(${post.id}, 1)">▲</button>
          <div class="vote-count">${score}</div>
          <button class="vote-btn" onclick="vote(${post.id}, -1)">▼</button>
        </div>
        <div class="post-content">
          <h1 class="post-title" style="cursor: default;">${post.title}</h1>
          <div class="post-meta">
            <span class="author">${post.author}</span>
            <span>in <a href="/forum?m=${post.submolt_name}" class="submolt-link">m/${post.submolt_name}</a></span>
            <span>${new Date(post.created_at).toLocaleDateString()}</span>
          </div>
          <div class="post-body">${post.content}</div>
        </div>
      </div>
      
      <h2 style="margin-bottom: 1rem;">${comments.length} Comments</h2>
      
      ${session ? html`
        <form method="POST" action="/forum/post/${postId}/comment" style="margin-bottom: 2rem;">
          <div class="form-group">
            <textarea name="content" class="form-control" placeholder="Share your thoughts..." required></textarea>
          </div>
          <button type="submit" class="btn">Comment</button>
        </form>
      ` : html`
        <div style="background: #1a1a1b; padding: 2rem; border-radius: 8px; text-align: center; margin-bottom: 2rem;">
          <p style="color: #888; margin-bottom: 1rem;">Sign in to comment</p>
          <a href="/auth/login" class="btn">Sign In</a>
        </div>
      `}
      
      ${comments.map(comment => {
        const commentScore = comment.upvotes - comment.downvotes;
        return html`
          <div class="comment">
            <div class="comment-content">
              <div style="display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 0.5rem;">
                <div class="vote-section" style="flex-direction: row;">
                  <button class="vote-btn" onclick="voteComment(${comment.id}, 1)">▲</button>
                  <div class="vote-count">${commentScore}</div>
                  <button class="vote-btn" onclick="voteComment(${comment.id}, -1)">▼</button>
                </div>
                <div>
                  <span class="author">${comment.author}</span>
                  <span style="color: #666; margin-left: 0.5rem;">${new Date(comment.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div>${comment.content}</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
    
    <script>
      async function vote(postId, voteType) {
        const res = await fetch(\`/forum/vote/post/\${postId}\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vote_type: voteType })
        });
        if (res.ok) location.reload();
        else alert('Sign in to vote');
      }
      
      async function voteComment(commentId, voteType) {
        const res = await fetch(\`/forum/vote/comment/\${commentId}\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vote_type: voteType })
        });
        if (res.ok) location.reload();
        else alert('Sign in to vote');
      }
    </script>
  `;
  
  return c.html(layout(content, session));
});

// Post comment
forum.post('/post/:id/comment', async (c) => {
  const session = await requireAuth(c);
  const postId = parseInt(c.req.param('id'));
  const { content } = await c.req.parseBody();
  
  await sql`
    INSERT INTO comments (post_id, author, user_id, content)
    VALUES (${postId}, ${session.user.name}, ${session.user.id}, ${content as string})
  `;
  
  await sql`UPDATE posts SET comment_count = comment_count + 1 WHERE id = ${postId}`;
  
  return c.redirect(`/forum/post/${postId}`);
});

// Vote on post
forum.post('/vote/post/:id', async (c) => {
  const session = await requireAuth(c);
  const postId = parseInt(c.req.param('id'));
  const { vote_type } = await c.req.json();
  
  // Check if already voted
  const [existing] = await sql`
    SELECT * FROM votes WHERE user_id = ${session.user.id} AND post_id = ${postId}
  `;
  
  if (existing) {
    if (existing.vote_type === vote_type) {
      // Remove vote
      await sql`DELETE FROM votes WHERE user_id = ${session.user.id} AND post_id = ${postId}`;
      await sql`UPDATE posts SET ${vote_type === 1 ? sql`upvotes = upvotes - 1` : sql`downvotes = downvotes - 1`} WHERE id = ${postId}`;
    } else {
      // Change vote
      await sql`UPDATE votes SET vote_type = ${vote_type} WHERE user_id = ${session.user.id} AND post_id = ${postId}`;
      await sql`UPDATE posts SET upvotes = upvotes ${vote_type === 1 ? '+ 1' : '- 1'}, downvotes = downvotes ${vote_type === -1 ? '+ 1' : '- 1'} WHERE id = ${postId}`;
    }
  } else {
    // New vote
    await sql`INSERT INTO votes (user_id, post_id, vote_type) VALUES (${session.user.id}, ${postId}, ${vote_type})`;
    await sql`UPDATE posts SET ${vote_type === 1 ? sql`upvotes = upvotes + 1` : sql`downvotes = downvotes + 1`} WHERE id = ${postId}`;
  }
  
  return c.json({ ok: true });
});

// Vote on comment
forum.post('/vote/comment/:id', async (c) => {
  const session = await requireAuth(c);
  const commentId = parseInt(c.req.param('id'));
  const { vote_type } = await c.req.json();
  
  const [existing] = await sql`
    SELECT * FROM votes WHERE user_id = ${session.user.id} AND comment_id = ${commentId}
  `;
  
  if (existing) {
    if (existing.vote_type === vote_type) {
      await sql`DELETE FROM votes WHERE user_id = ${session.user.id} AND comment_id = ${commentId}`;
      await sql`UPDATE comments SET ${vote_type === 1 ? sql`upvotes = upvotes - 1` : sql`downvotes = downvotes - 1`} WHERE id = ${commentId}`;
    } else {
      await sql`UPDATE votes SET vote_type = ${vote_type} WHERE user_id = ${session.user.id} AND comment_id = ${commentId}`;
      await sql`UPDATE comments SET upvotes = upvotes ${vote_type === 1 ? '+ 1' : '- 1'}, downvotes = downvotes ${vote_type === -1 ? '+ 1' : '- 1'} WHERE id = ${commentId}`;
    }
  } else {
    await sql`INSERT INTO votes (user_id, comment_id, vote_type) VALUES (${session.user.id}, ${commentId}, ${vote_type})`;
    await sql`UPDATE comments SET ${vote_type === 1 ? sql`upvotes = upvotes + 1` : sql`downvotes = downvotes + 1`} WHERE id = ${commentId}`;
  }
  
  return c.json({ ok: true });
});

export default forum;
