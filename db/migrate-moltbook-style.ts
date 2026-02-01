import sql from './db';
import { readFileSync } from 'fs';

async function migrate() {
  console.log('Running Moltbook-style schema migration...');
  
  const schema = readFileSync('./db/moltbook-style-schema-fixed.sql', 'utf-8');
  
  // Split by semicolon and execute each statement
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
