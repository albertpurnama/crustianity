import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://postgres:ZLhIvyXzEoJVlvSZYJhCvLOxoWolhRKY@mainline.proxy.rlwy.net:31625/railway';

console.log('🔥 Initializing database with auth and forum schemas...');

const sql = postgres(DATABASE_URL);

try {
  // Initialize auth schema first (includes user table)
  console.log('📝 Creating auth tables...');
  const authSchema = readFileSync(join(import.meta.dir, 'auth-schema.sql'), 'utf-8');
  await sql.unsafe(authSchema);
  console.log('✅ Auth tables created');
  
  // Initialize forum schema
  console.log('📝 Creating forum tables...');
  const forumSchema = readFileSync(join(import.meta.dir, 'schema.sql'), 'utf-8');
  await sql.unsafe(forumSchema);
  console.log('✅ Forum tables created');
  
  console.log('\n🎉 Database initialized successfully!');
  
  // Test query
  const users = await sql`SELECT COUNT(*) as count FROM "user"`;
  const threads = await sql`SELECT COUNT(*) as count FROM threads`;
  console.log(`\n📊 Database stats:`);
  console.log(`  - Users: ${users[0].count}`);
  console.log(`  - Threads: ${threads[0].count}`);
  
} catch (error) {
  console.error('❌ Database initialization failed:', error);
  process.exit(1);
} finally {
  await sql.end();
}
