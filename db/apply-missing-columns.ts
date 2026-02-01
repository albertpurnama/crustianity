import sql from './db';
import { readFileSync } from 'fs';

async function migrate() {
  console.log('Adding missing BetterAuth columns...');
  
  const schema = readFileSync('./db/add-missing-columns.sql', 'utf-8');
  const statements = schema.split(';').filter(s => s.trim());
  
  for (const statement of statements) {
    if (statement.trim()) {
      try {
        await sql.unsafe(statement);
        console.log('✓', statement.substring(0, 70).replace(/\n/g, ' ').replace(/  +/g, ' '));
      } catch (error: any) {
        console.error('✗ Error:', error.message);
      }
    }
  }
  
  console.log('Done!');
  process.exit(0);
}

migrate();
