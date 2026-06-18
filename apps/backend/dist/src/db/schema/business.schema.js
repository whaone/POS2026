"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devices = exports.barcodeSettings = exports.invoiceTemplates = exports.businesses = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const location_schema_1 = require("./location.schema");
exports.businesses = (0, pg_core_1.pgTable)('businesses', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    currency: (0, pg_core_1.varchar)('currency', { length: 3 }).notNull().default('IDR'),
    timezone: (0, pg_core_1.varchar)('timezone', { length: 100 })
        .notNull()
        .default('Asia/Jakarta'),
    financialYearStartMonth: (0, pg_core_1.integer)('financial_year_start_month')
        .notNull()
        .default(1),
    profitMargin: (0, pg_core_1.integer)('profit_margin').notNull().default(0),
    taxNumber: (0, pg_core_1.varchar)('tax_number', { length: 100 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.invoiceTemplates = (0, pg_core_1.pgTable)('invoice_templates', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => exports.businesses.id, { onDelete: 'cascade' }),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    layoutJson: (0, pg_core_1.jsonb)('layout_json').notNull().default({}),
    isDefault: (0, pg_core_1.boolean)('is_default').notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.barcodeSettings = (0, pg_core_1.pgTable)('barcode_settings', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => exports.businesses.id, { onDelete: 'cascade' }),
    labelSize: (0, pg_core_1.varchar)('label_size', { length: 50 }),
    columns: (0, pg_core_1.integer)('columns').notNull().default(1),
    symbology: (0, pg_core_1.varchar)('symbology', { length: 50 }).notNull().default('EAN-13'),
    fieldsJson: (0, pg_core_1.jsonb)('fields_json').default([]),
});
exports.devices = (0, pg_core_1.pgTable)('devices', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => exports.businesses.id, { onDelete: 'cascade' }),
    locationId: (0, pg_core_1.uuid)('location_id').references(() => location_schema_1.locations.id),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull(),
    configJson: (0, pg_core_1.jsonb)('config_json').default({}),
});
//# sourceMappingURL=business.schema.js.map