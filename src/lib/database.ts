import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// For development - SQLite
const sqlite = new Database('secure-data-room.db');
export const db = drizzle(sqlite, { schema });

// For production - you would use PostgreSQL:
// import { drizzle } from 'drizzle-orm/postgres-js';
// import postgres from 'postgres';
// 
// const connectionString = process.env.DATABASE_URL!;
// const client = postgres(connectionString);
// export const db = drizzle(client, { schema });

export type Database = typeof db;