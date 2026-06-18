"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commissionAgents = exports.payrolls = exports.expenses = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const business_schema_1 = require("./business.schema");
const location_schema_1 = require("./location.schema");
const accounting_schema_1 = require("./accounting.schema");
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id').notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull().unique(),
    passwordHash: (0, pg_core_1.varchar)('password_hash', { length: 255 }).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).notNull().default('active'),
    refreshToken: (0, pg_core_1.text)('refresh_token'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.expenses = (0, pg_core_1.pgTable)('expenses', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id, { onDelete: 'cascade' }),
    locationId: (0, pg_core_1.uuid)('location_id')
        .notNull()
        .references(() => location_schema_1.locations.id),
    category: (0, pg_core_1.varchar)('category', { length: 255 }).notNull(),
    amount: (0, pg_core_1.integer)('amount').notNull(),
    accountId: (0, pg_core_1.uuid)('account_id').references(() => accounting_schema_1.accounts.id),
    date: (0, pg_core_1.timestamp)('date').defaultNow().notNull(),
    note: (0, pg_core_1.text)('note'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.payrolls = (0, pg_core_1.pgTable)('payrolls', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    period: (0, pg_core_1.varchar)('period', { length: 50 }).notNull(),
    amount: (0, pg_core_1.integer)('amount').notNull(),
    note: (0, pg_core_1.text)('note'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.commissionAgents = (0, pg_core_1.pgTable)('commission_agents', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    rate: (0, pg_core_1.integer)('rate').notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
//# sourceMappingURL=user.schema.js.map