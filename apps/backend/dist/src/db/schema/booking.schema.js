"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preorderItems = exports.preorders = exports.bookings = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const business_schema_1 = require("./business.schema");
const location_schema_1 = require("./location.schema");
const customer_schema_1 = require("./customer.schema");
const product_schema_1 = require("./product.schema");
exports.bookings = (0, pg_core_1.pgTable)('bookings', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id, { onDelete: 'cascade' }),
    locationId: (0, pg_core_1.uuid)('location_id')
        .notNull()
        .references(() => location_schema_1.locations.id),
    customerId: (0, pg_core_1.uuid)('customer_id')
        .notNull()
        .references(() => customer_schema_1.customers.id),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull(),
    resourceId: (0, pg_core_1.varchar)('resource_id', { length: 255 }),
    startTime: (0, pg_core_1.timestamp)('start_time').notNull(),
    endTime: (0, pg_core_1.timestamp)('end_time').notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).notNull().default('confirmed'),
    dpAmount: (0, pg_core_1.integer)('dp_amount').notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.preorders = (0, pg_core_1.pgTable)('preorders', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id, { onDelete: 'cascade' }),
    locationId: (0, pg_core_1.uuid)('location_id')
        .notNull()
        .references(() => location_schema_1.locations.id),
    customerId: (0, pg_core_1.uuid)('customer_id')
        .notNull()
        .references(() => customer_schema_1.customers.id),
    source: (0, pg_core_1.varchar)('source', { length: 50 }).notNull().default('pos'),
    pickupCode: (0, pg_core_1.varchar)('pickup_code', { length: 100 }),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).notNull().default('reserved'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.preorderItems = (0, pg_core_1.pgTable)('preorder_items', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    preorderId: (0, pg_core_1.uuid)('preorder_id')
        .notNull()
        .references(() => exports.preorders.id, { onDelete: 'cascade' }),
    productId: (0, pg_core_1.uuid)('product_id')
        .notNull()
        .references(() => product_schema_1.products.id),
    variationId: (0, pg_core_1.uuid)('variation_id').references(() => product_schema_1.productVariations.id),
    qty: (0, pg_core_1.integer)('qty').notNull(),
});
//# sourceMappingURL=booking.schema.js.map