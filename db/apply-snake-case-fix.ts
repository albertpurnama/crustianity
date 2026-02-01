import sql from './db';
import { readFileSync } from 'fs';

async function migrate() {
  console.log('Removing NOT NULL constraints from snake_case columns...');
  
  const schema = readFileSync('./db/remove-snake-case-constraints.sql', 'utf-8');
  const statements = schema.split(';').filter(s => s.trim());
  
  for (const statement of statements) {
    if (statement.trim()) {
      try {
        await sql.unsafe(statement);
        console.log('✓', statement.substring(0, 70).replace(/\n/g, ' ').replace(/  +/g, ' '));
      } catch (error: any) {
        if (error.message?.includes('does not exist')) {
          console.log('⊘ (already done)', statement.substring(0, 50).replace(/\n/g, ' '));
        } else {
          console.error('✗ Error:', error.message);
        }
      }
    }
  }
  
  console.log('Done!');
  process.exit(0);
}

migrate();
