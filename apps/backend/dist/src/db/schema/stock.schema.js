"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockTransferItems = exports.stockTransfers = exports.stockAdjustmentItems = exports.stockAdjustments = exports.stockSerials = exports.stock = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const business_schema_1 = require("./business.schema");
const location_schema_1 = require("./location.schema");
const product_schema_1 = require("./product.schema");
exports.stock = (0, pg_core_1.pgTable)('stock', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id, { onDelete: 'cascade' }),
    locationId: (0, pg_core_1.uuid)('location_id')
        .notNull()
        .references(() => location_schema_1.locations.id),
    productId: (0, pg_core_1.uuid)('product_id').references(() => product_schema_1.products.id),
    variationId: (0, pg_core_1.uuid)('variation_id').references(() => product_schema_1.productVariations.id),
    qty: (0, pg_core_1.integer)('qty').notNull().default(0),
    qtyHeld: (0, pg_core_1.integer)('qty_held').notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.stockSerials = (0, pg_core_1.pgTable)('stock_serials', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    stockId: (0, pg_core_1.uuid)('stock_id')
        .notNull()
        .references(() => exports.stock.id, { onDelete: 'cascade' }),
    imeiSerial: (0, pg_core_1.varchar)('imei_serial', { length: 100 }),
    lotNumber: (0, pg_core_1.varchar)('lot_number', { length: 100 }),
    expiryDate: (0, pg_core_1.timestamp)('expiry_date'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.stockAdjustments = (0, pg_core_1.pgTable)('stock_adjustments', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id),
    locationId: (0, pg_core_1.uuid)('location_id')
        .notNull()
        .references(() => location_schema_1.locations.id),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull(),
    reason: (0, pg_core_1.varchar)('reason', { length: 255 }),
    recoveryAmount: (0, pg_core_1.integer)('recovery_amount').notNull().default(0),
    createdBy: (0, pg_core_1.uuid)('created_by'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.stockAdjustmentItems = (0, pg_core_1.pgTable)('stock_adjustment_items', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    adjustmentId: (0, pg_core_1.uuid)('adjustment_id')
        .notNull()
        .references(() => exports.stockAdjustments.id, { onDelete: 'cascade' }),
    productId: (0, pg_core_1.uuid)('product_id').references(() => product_schema_1.products.id),
    variationId: (0, pg_core_1.uuid)('variation_id').references(() => product_schema_1.productVariations.id),
    qty: (0, pg_core_1.integer)('qty').notNull(),
});
exports.stockTransfers = (0, pg_core_1.pgTable)('stock_transfers', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id),
    fromLocationId: (0, pg_core_1.uuid)('from_location_id')
        .notNull()
        .references(() => location_schema_1.locations.id),
    toLocationId: (0, pg_core_1.uuid)('to_location_id')
        .notNull()
        .references(() => location_schema_1.locations.id),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).notNull().default('in_transit'),
    shippingCharge: (0, pg_core_1.integer)('shipping_charge').notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    receivedAt: (0, pg_core_1.timestamp)('received_at'),
});
exports.stockTransferItems = (0, pg_core_1.pgTable)('stock_transfer_items', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    transferId: (0, pg_core_1.uuid)('transfer_id')
        .notNull()
        .references(() => exports.stockTransfers.id, { onDelete: 'cascade' }),
    productId: (0, pg_core_1.uuid)('product_id').references(() => product_schema_1.products.id),
    variationId: (0, pg_core_1.uuid)('variation_id').references(() => product_schema_1.productVariations.id),
    qty: (0, pg_core_1.integer)('qty').notNull(),
});
//# sourceMappingURL=stock.schema.js.map