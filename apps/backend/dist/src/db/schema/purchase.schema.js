"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseReturnItems = exports.purchaseReturns = exports.purchasePayments = exports.purchaseItems = exports.purchases = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const business_schema_1 = require("./business.schema");
const location_schema_1 = require("./location.schema");
const product_schema_1 = require("./product.schema");
const contact_schema_1 = require("./contact.schema");
exports.purchases = (0, pg_core_1.pgTable)('purchases', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id, { onDelete: 'cascade' }),
    locationId: (0, pg_core_1.uuid)('location_id')
        .notNull()
        .references(() => location_schema_1.locations.id),
    supplierId: (0, pg_core_1.uuid)('supplier_id')
        .notNull()
        .references(() => contact_schema_1.contacts.id),
    subtotal: (0, pg_core_1.integer)('subtotal').notNull().default(0),
    taxTotal: (0, pg_core_1.integer)('tax_total').notNull().default(0),
    discount: (0, pg_core_1.integer)('discount').notNull().default(0),
    shipping: (0, pg_core_1.integer)('shipping').notNull().default(0),
    grandTotal: (0, pg_core_1.integer)('grand_total').notNull().default(0),
    paidTotal: (0, pg_core_1.integer)('paid_total').notNull().default(0),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).notNull().default('credit'),
    documentUrl: (0, pg_core_1.varchar)('document_url', { length: 500 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.purchaseItems = (0, pg_core_1.pgTable)('purchase_items', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    purchaseId: (0, pg_core_1.uuid)('purchase_id')
        .notNull()
        .references(() => exports.purchases.id, { onDelete: 'cascade' }),
    productId: (0, pg_core_1.uuid)('product_id')
        .notNull()
        .references(() => product_schema_1.products.id),
    variationId: (0, pg_core_1.uuid)('variation_id').references(() => product_schema_1.productVariations.id),
    qty: (0, pg_core_1.integer)('qty').notNull(),
    cost: (0, pg_core_1.integer)('cost').notNull().default(0),
    tax: (0, pg_core_1.integer)('tax').notNull().default(0),
    lotNumber: (0, pg_core_1.varchar)('lot_number', { length: 100 }),
    expiryDate: (0, pg_core_1.timestamp)('expiry_date'),
});
exports.purchasePayments = (0, pg_core_1.pgTable)('purchase_payments', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    purchaseId: (0, pg_core_1.uuid)('purchase_id')
        .notNull()
        .references(() => exports.purchases.id, { onDelete: 'cascade' }),
    method: (0, pg_core_1.varchar)('method', { length: 50 }).notNull(),
    amount: (0, pg_core_1.integer)('amount').notNull(),
    accountId: (0, pg_core_1.uuid)('account_id'),
    paidAt: (0, pg_core_1.timestamp)('paid_at').defaultNow().notNull(),
});
exports.purchaseReturns = (0, pg_core_1.pgTable)('purchase_returns', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    purchaseId: (0, pg_core_1.uuid)('purchase_id')
        .notNull()
        .references(() => exports.purchases.id, { onDelete: 'cascade' }),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id),
    reason: (0, pg_core_1.varchar)('reason', { length: 255 }),
    amount: (0, pg_core_1.integer)('amount').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.purchaseReturnItems = (0, pg_core_1.pgTable)('purchase_return_items', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    returnId: (0, pg_core_1.uuid)('return_id')
        .notNull()
        .references(() => exports.purchaseReturns.id, { onDelete: 'cascade' }),
    purchaseItemId: (0, pg_core_1.uuid)('purchase_item_id')
        .notNull()
        .references(() => exports.purchaseItems.id, { onDelete: 'cascade' }),
    qty: (0, pg_core_1.integer)('qty').notNull(),
});
//# sourceMappingURL=purchase.schema.js.map