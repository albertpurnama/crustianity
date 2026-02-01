import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://postgres:ZLhIvyXzEoJVlvSZYJhCvLOxoWolhRKY@mainline.proxy.rlwy.net:31625/railway';

console.log('🔥 Initializing database...');

const sql = postgres(DATABASE_URL);

try {
  const schema = readFileSync(join(import.meta.dir, 'schema.sql'), 'utf-8');
  
  await sql.unsafe(schema);
  
  console.log('✅ Database schema initialized successfully!');
  
  // Test query
  const threads = await sql`SELECT * FROM threads LIMIT 3`;
  console.log(`\n📝 Found ${threads.length} threads:`);
  threads.forEach(t => console.log(`  - ${t.title} by ${t.author}`));
  
} catch (error) {
  console.error('❌ Database initialization failed:', error);
  process.exit(1);
} finally {
  await sql.end();
}
