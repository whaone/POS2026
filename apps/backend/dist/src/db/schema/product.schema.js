"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productPrices = exports.sellingPriceGroups = exports.productVariations = exports.products = exports.taxes = exports.units = exports.categories = exports.brands = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const business_schema_1 = require("./business.schema");
exports.brands = (0, pg_core_1.pgTable)('brands', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id, { onDelete: 'cascade' }),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.categories = (0, pg_core_1.pgTable)('categories', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id, { onDelete: 'cascade' }),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    parentId: (0, pg_core_1.uuid)('parent_id').references(() => exports.categories.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.units = (0, pg_core_1.pgTable)('units', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id, { onDelete: 'cascade' }),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    shortName: (0, pg_core_1.varchar)('short_name', { length: 50 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.taxes = (0, pg_core_1.pgTable)('taxes', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id, { onDelete: 'cascade' }),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    rate: (0, pg_core_1.decimal)('rate', { precision: 5, scale: 2 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.products = (0, pg_core_1.pgTable)('products', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id, { onDelete: 'cascade' }),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull().default('single'),
    brandId: (0, pg_core_1.uuid)('brand_id').references(() => exports.brands.id),
    categoryId: (0, pg_core_1.uuid)('category_id').references(() => exports.categories.id),
    unitId: (0, pg_core_1.uuid)('unit_id').references(() => exports.units.id),
    taxId: (0, pg_core_1.uuid)('tax_id').references(() => exports.taxes.id),
    manageStock: (0, pg_core_1.boolean)('manage_stock').notNull().default(true),
    hasExpiry: (0, pg_core_1.boolean)('has_expiry').notNull().default(false),
    sku: (0, pg_core_1.varchar)('sku', { length: 100 }).notNull(),
    barcode: (0, pg_core_1.varchar)('barcode', { length: 100 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.productVariations = (0, pg_core_1.pgTable)('product_variations', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    productId: (0, pg_core_1.uuid)('product_id')
        .notNull()
        .references(() => exports.products.id, { onDelete: 'cascade' }),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    sku: (0, pg_core_1.varchar)('sku', { length: 100 }).notNull(),
    attributesJson: (0, pg_core_1.jsonb)('attributes_json'),
});
exports.sellingPriceGroups = (0, pg_core_1.pgTable)('selling_price_groups', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    businessId: (0, pg_core_1.uuid)('business_id')
        .notNull()
        .references(() => business_schema_1.businesses.id, { onDelete: 'cascade' }),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
});
exports.productPrices = (0, pg_core_1.pgTable)('product_prices', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    productId: (0, pg_core_1.uuid)('product_id').references(() => exports.products.id, {
        onDelete: 'cascade',
    }),
    variationId: (0, pg_core_1.uuid)('variation_id').references(() => exports.productVariations.id, {
        onDelete: 'cascade',
    }),
    priceGroupId: (0, pg_core_1.uuid)('price_group_id')
        .notNull()
        .references(() => exports.sellingPriceGroups.id, { onDelete: 'cascade' }),
    price: (0, pg_core_1.integer)('price').notNull(),
});
//# sourceMappingURL=product.schema.js.map