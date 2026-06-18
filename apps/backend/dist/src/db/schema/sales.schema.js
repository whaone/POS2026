"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.heldCarts = exports.transactionTabs = exports.salePayments = exports.saleItems = exports.sales = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const business_schema_1 = require("./business.schema");
const location_schema_1 = require("./location.schema");
const product_schema_1 = require("./product.schema");
exports.sales = (0, pg_core_1.pgTable)('sales', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id),
    locationId: (0, pg_core_1.uuid)('location_id')
        .notNull()
        .references(() => location_schema_1.locations.id),
    customerId: (0, pg_core_1.uuid)('customer_id'),
    cashierId: (0, pg_core_1.uuid)('cashier_id'),
    commissionAgentId: (0, pg_core_1.uuid)('commission_agent_id'),
    subtotal: (0, pg_core_1.integer)('subtotal').notNull().default(0),
    taxTotal: (0, pg_core_1.integer)('tax_total').notNull().default(0),
    discountTotal: (0, pg_core_1.integer)('discount_total').notNull().default(0),
    shipping: (0, pg_core_1.integer)('shipping').notNull().default(0),
    grandTotal: (0, pg_core_1.integer)('grand_total').notNull().default(0),
    paidTotal: (0, pg_core_1.integer)('paid_total').notNull().default(0),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).notNull().default('held'),
    shiftId: (0, pg_core_1.uuid)('shift_id'),
    idempotencyKey: (0, pg_core_1.varchar)('idempotency_key', { length: 255 }).unique(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.saleItems = (0, pg_core_1.pgTable)('sale_items', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    saleId: (0, pg_core_1.uuid)('sale_id')
        .notNull()
        .references(() => exports.sales.id, { onDelete: 'cascade' }),
    productId: (0, pg_core_1.uuid)('product_id').references(() => product_schema_1.products.id),
    variationId: (0, pg_core_1.uuid)('variation_id').references(() => product_schema_1.productVariations.id),
    qty: (0, pg_core_1.integer)('qty').notNull(),
    unitPrice: (0, pg_core_1.integer)('unit_price').notNull(),
    discount: (0, pg_core_1.integer)('discount').notNull().default(0),
    tax: (0, pg_core_1.integer)('tax').notNull().default(0),
    lineTotal: (0, pg_core_1.integer)('line_total').notNull().default(0),
});
exports.salePayments = (0, pg_core_1.pgTable)('sale_payments', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    saleId: (0, pg_core_1.uuid)('sale_id')
        .notNull()
        .references(() => exports.sales.id, { onDelete: 'cascade' }),
    method: (0, pg_core_1.varchar)('method', { length: 50 }).notNull(),
    amount: (0, pg_core_1.integer)('amount').notNull(),
    accountId: (0, pg_core_1.uuid)('account_id'),
    ref: (0, pg_core_1.varchar)('ref', { length: 255 }),
});
exports.transactionTabs = (0, pg_core_1.pgTable)('transaction_tabs', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id),
    locationId: (0, pg_core_1.uuid)('location_id')
        .notNull()
        .references(() => location_schema_1.locations.id),
    shiftId: (0, pg_core_1.uuid)('shift_id'),
    cashierId: (0, pg_core_1.uuid)('cashier_id'),
    customerId: (0, pg_core_1.uuid)('customer_id'),
    tabIndex: (0, pg_core_1.integer)('tab_index').notNull(),
    label: (0, pg_core_1.varchar)('label', { length: 100 }),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).notNull().default('active'),
    cartJson: (0, pg_core_1.varchar)('cart_json'),
    itemCount: (0, pg_core_1.integer)('item_count').notNull().default(0),
    subtotalAmount: (0, pg_core_1.integer)('subtotal_amount').notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
    heldAt: (0, pg_core_1.timestamp)('held_at'),
});
exports.heldCarts = (0, pg_core_1.pgTable)('held_carts', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id),
    locationId: (0, pg_core_1.uuid)('location_id')
        .notNull()
        .references(() => location_schema_1.locations.id),
    cashierId: (0, pg_core_1.uuid)('cashier_id'),
    customerId: (0, pg_core_1.uuid)('customer_id'),
    cartJson: (0, pg_core_1.varchar)('cart_json'),
    sourceTabId: (0, pg_core_1.uuid)('source_tab_id'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
//# sourceMappingURL=sales.schema.js.map