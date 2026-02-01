import sql from './db';

async function migrate() {
  console.log('Adding updatedAt to session table...');
  
  await sql`ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT NOW()`;
  console.log('✓ Added updatedAt column');
  
  // Update existing rows
  await sql`UPDATE "session" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL`;
  console.log('✓ Updated existing rows');
  
  console.log('Done!');
  process.exit(0);
}

migrate();
