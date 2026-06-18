"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const role_schema_1 = require("../schema/role.schema");
const permissions_seed_1 = require("./permissions.seed");
const dotenv = __importStar(require("dotenv"));
const path_1 = require("path");
dotenv.config({ path: (0, path_1.resolve)(process.cwd(), '.env') });
async function runSeed() {
    console.log('🌱 Starting seeder...');
    const pool = new pg_1.Pool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'pos2026',
    });
    const db = (0, node_postgres_1.drizzle)(pool);
    try {
        console.log('Seeding permissions...');
        for (const perm of permissions_seed_1.PREDEFINED_PERMISSIONS) {
            await db
                .insert(role_schema_1.permissions)
                .values({
                code: perm.code,
                description: perm.description,
            })
                .onConflictDoNothing();
        }
        console.log('✅ Seeding completed!');
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
    }
    finally {
        await pool.end();
    }
}
void runSeed();
//# sourceMappingURL=run-seed.js.map