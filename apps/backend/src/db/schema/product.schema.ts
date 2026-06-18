import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  jsonb,
  decimal,
  integer,
  AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { businesses } from './business.schema';

export const brands = pgTable('brands', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  parentId: uuid('parent_id').references((): AnyPgColumn => categories.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const units = pgTable('units', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  shortName: varchar('short_name', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const taxes = pgTable('taxes', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  rate: decimal('rate', { precision: 5, scale: 2 }).notNull(), // e.g. 11.00
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull().default('single'), // single | variable
  brandId: uuid('brand_id').references(() => brands.id),
  categoryId: uuid('category_id').references(() => categories.id),
  unitId: uuid('unit_id').references(() => units.id),
  taxId: uuid('tax_id').references(() => taxes.id),
  manageStock: boolean('manage_stock').notNull().default(true),
  hasExpiry: boolean('has_expiry').notNull().default(false),
  sku: varchar('sku', { length: 100 }).notNull(),
  barcode: varchar('barcode', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const productVariations = pgTable('product_variations', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  sku: varchar('sku', { length: 100 }).notNull(),
  attributesJson: jsonb('attributes_json'),
});

export const sellingPriceGroups = pgTable('selling_price_groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
});

// Storing money as integer minor-unit (e.g. cents, rupiah)
export const productPrices = pgTable('product_prices', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id, {
    onDelete: 'cascade',
  }),
  variationId: uuid('variation_id').references(() => productVariations.id, {
    onDelete: 'cascade',
  }),
  priceGroupId: uuid('price_group_id')
    .notNull()
    .references(() => sellingPriceGroups.id, { onDelete: 'cascade' }),
  price: integer('price').notNull(), // minor-unit integer (NO float)
});
