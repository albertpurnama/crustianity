import sql from './db';
import { readFileSync } from 'fs';

async function migrate() {
  console.log('Fixing BetterAuth camelCase columns...');
  
  const schema = readFileSync('./db/fix-betterauth-columns.sql', 'utf-8');
  const statements = schema.split(';').filter(s => s.trim());
  
  for (const statement of statements) {
    if (statement.trim()) {
      try {
        await sql.unsafe(statement);
        console.log('✓ Executed:', statement.substring(0, 60).replace(/\n/g, ' ') + '...');
      } catch (error) {
        console.error('✗ Error:', statement.substring(0, 60).replace(/\n/g, ' ') + '...', error);
      }
    }
  }
  
  console.log('Migration complete!');
  process.exit(0);
}

migrate();
