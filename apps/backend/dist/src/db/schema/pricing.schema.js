"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voucherRedemptions = exports.vouchers = exports.markdowns = exports.discounts = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const business_schema_1 = require("./business.schema");
const product_schema_1 = require("./product.schema");
const location_schema_1 = require("./location.schema");
exports.discounts = (0, pg_core_1.pgTable)('discounts', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id, { onDelete: 'cascade' }),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull(),
    configJson: (0, pg_core_1.jsonb)('config_json').notNull(),
    startDate: (0, pg_core_1.timestamp)('start_date'),
    endDate: (0, pg_core_1.timestamp)('end_date'),
    active: (0, pg_core_1.boolean)('active').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.markdowns = (0, pg_core_1.pgTable)('markdowns', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id, { onDelete: 'cascade' }),
    productId: (0, pg_core_1.uuid)('product_id')
        .notNull()
        .references(() => product_schema_1.products.id, { onDelete: 'cascade' }),
    rule: (0, pg_core_1.varchar)('rule', { length: 50 }).notNull(),
    configJson: (0, pg_core_1.jsonb)('config_json').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.vouchers = (0, pg_core_1.pgTable)('vouchers', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id, { onDelete: 'cascade' }),
    code: (0, pg_core_1.varchar)('code', { length: 100 }).notNull().unique(),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull(),
    value: (0, pg_core_1.integer)('value').notNull(),
    maxDiscount: (0, pg_core_1.integer)('max_discount'),
    minPurchase: (0, pg_core_1.integer)('min_purchase').notNull().default(0),
    branchScope: (0, pg_core_1.jsonb)('branch_scope'),
    productScope: (0, pg_core_1.jsonb)('product_scope'),
    startDate: (0, pg_core_1.timestamp)('start_date'),
    expiryDate: (0, pg_core_1.timestamp)('expiry_date'),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).notNull().default('active'),
    isStackable: (0, pg_core_1.boolean)('is_stackable').notNull().default(false),
    batchId: (0, pg_core_1.varchar)('batch_id', { length: 100 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.voucherRedemptions = (0, pg_core_1.pgTable)('voucher_redemptions', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    voucherId: (0, pg_core_1.uuid)('voucher_id')
        .notNull()
        .unique()
        .references(() => exports.vouchers.id, { onDelete: 'cascade' }),
    transactionId: (0, pg_core_1.uuid)('transaction_id').notNull(),
    branchId: (0, pg_core_1.uuid)('branch_id').references(() => location_schema_1.locations.id),
    cashierId: (0, pg_core_1.uuid)('cashier_id'),
    amountUsed: (0, pg_core_1.integer)('amount_used').notNull(),
    redeemedAt: (0, pg_core_1.timestamp)('redeemed_at').defaultNow().notNull(),
});
//# sourceMappingURL=pricing.schema.js.map