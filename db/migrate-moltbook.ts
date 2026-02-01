import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://postgres:ZLhIvyXzEoJVlvSZYJhCvLOxoWolhRKY@mainline.proxy.rlwy.net:31625/railway';

console.log('🔥 Running Moltbook migration...');

const sql = postgres(DATABASE_URL);

try {
  const migration = readFileSync(join(import.meta.dir, 'moltbook-migration.sql'), 'utf-8');
  
  await sql.unsafe(migration);
  
  console.log('✅ Moltbook columns added to user table');
  
  // Verify columns exist
  const result = await sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'user' 
    AND column_name LIKE 'moltbook%'
  `;
  
  console.log('\n📊 Moltbook columns in user table:');
  result.forEach(row => console.log(`  - ${row.column_name}`));
  
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  await sql.end();
}
