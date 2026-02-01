import sql from './db';
import { readFileSync } from 'fs';

async function migrate() {
  console.log('Running X verification schema migration...');
  
  const schema = readFileSync('./db/x-verification-schema.sql', 'utf-8');
  const statements = schema.split(';').filter(s => s.trim());
  
  for (const statement of statements) {
    if (statement.trim()) {
      try {
        await sql.unsafe(statement);
        console.log('✓ Executed:', statement.substring(0, 50) + '...');
      } catch (error) {
        console.error('✗ Error:', statement.substring(0, 50) + '...', error);
      }
    }
  }
  
  console.log('Migration complete!');
  process.exit(0);
}

migrate();
