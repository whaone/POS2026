import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export function initDb(config: {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}) {
  if (!pool) {
    pool = new Pool(config);
  }
  if (!db) {
    db = drizzle(pool);
  }
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDb first.');
  }
  return db;
}

export async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
  }
}
