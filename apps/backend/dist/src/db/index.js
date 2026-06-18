"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDb = initDb;
exports.getDb = getDb;
exports.closeDb = closeDb;
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
let pool = null;
let db = null;
function initDb(config) {
    if (!pool) {
        pool = new pg_1.Pool(config);
    }
    if (!db) {
        db = (0, node_postgres_1.drizzle)(pool);
    }
    return db;
}
function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call initDb first.');
    }
    return db;
}
async function closeDb() {
    if (pool) {
        await pool.end();
        pool = null;
        db = null;
    }
}
//# sourceMappingURL=index.js.map