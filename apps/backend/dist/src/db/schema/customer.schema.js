"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberships = exports.loyaltyTransactions = exports.loyaltyAccounts = exports.customers = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const business_schema_1 = require("./business.schema");
const product_schema_1 = require("./product.schema");
exports.customers = (0, pg_core_1.pgTable)('customers', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id, { onDelete: 'cascade' }),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    phone: (0, pg_core_1.varchar)('phone', { length: 50 }),
    email: (0, pg_core_1.varchar)('email', { length: 255 }),
    category: (0, pg_core_1.varchar)('category', { length: 50 }).notNull().default('retail'),
    priceGroupId: (0, pg_core_1.uuid)('price_group_id').references(() => product_schema_1.sellingPriceGroups.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.loyaltyAccounts = (0, pg_core_1.pgTable)('loyalty_accounts', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    customerId: (0, pg_core_1.uuid)('customer_id')
        .notNull()
        .references(() => exports.customers.id, { onDelete: 'cascade' }),
    pointsBalance: (0, pg_core_1.integer)('points_balance').notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.loyaltyTransactions = (0, pg_core_1.pgTable)('loyalty_transactions', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    customerId: (0, pg_core_1.uuid)('customer_id')
        .notNull()
        .references(() => exports.customers.id, { onDelete: 'cascade' }),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull(),
    points: (0, pg_core_1.integer)('points').notNull(),
    saleId: (0, pg_core_1.uuid)('sale_id'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.memberships = (0, pg_core_1.pgTable)('memberships', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id, { onDelete: 'cascade' }),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    rulesJson: (0, pg_core_1.jsonb)('rules_json'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
//# sourceMappingURL=customer.schema.js.map