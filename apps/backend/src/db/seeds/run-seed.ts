import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { permissions } from '../schema/role.schema';
import { PREDEFINED_PERMISSIONS } from './permissions.seed';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

async function runSeed() {
  console.log('🌱 Starting seeder...');

  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'pos2026',
  });

  const db = drizzle(pool);

  try {
    // 1. Seed Permissions
    console.log('Seeding permissions...');
    for (const perm of PREDEFINED_PERMISSIONS) {
      await db
        .insert(permissions)
        .values({
          code: perm.code,
          description: perm.description,
        })
        .onConflictDoNothing();
    }

    // Getting the default business ID or creating a dummy one for the global roles
    // Wait, roles need a businessId. If we seed predefined roles, how do we handle businessId?
    // In many multi-tenant POS systems, predefined roles are either global (null businessId)
    // or instantiated per business when the business is created.
    // Let's assume we need to instantiate them per business.
    // The seed script will just insert permissions, and we will create a service method
    // to instantiate default roles for a new business.

    console.log('✅ Seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

void runSeed();
