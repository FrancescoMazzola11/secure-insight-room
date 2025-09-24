import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from '../lib/database';

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    
    // Run migrations from the migrations folder
    await migrate(db, { migrationsFolder: './drizzle' });
    
    console.log('✅ Database migrations completed successfully!');
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    process.exit(1);
  }
}

runMigrations();