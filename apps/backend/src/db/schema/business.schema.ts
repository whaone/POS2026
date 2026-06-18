import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  jsonb,
  boolean,
} from 'drizzle-orm/pg-core';
import { locations } from './location.schema';

export const businesses = pgTable('businesses', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('IDR'),
  timezone: varchar('timezone', { length: 100 })
    .notNull()
    .default('Asia/Jakarta'),
  financialYearStartMonth: integer('financial_year_start_month')
    .notNull()
    .default(1),
  profitMargin: integer('profit_margin').notNull().default(0),
  taxNumber: varchar('tax_number', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const invoiceTemplates = pgTable('invoice_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  layoutJson: jsonb('layout_json').notNull().default({}),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const barcodeSettings = pgTable('barcode_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  labelSize: varchar('label_size', { length: 50 }),
  columns: integer('columns').notNull().default(1),
  symbology: varchar('symbology', { length: 50 }).notNull().default('EAN-13'),
  fieldsJson: jsonb('fields_json').default([]),
});

export const devices = pgTable('devices', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  locationId: uuid('location_id').references(() => locations.id),
  type: varchar('type', { length: 50 }).notNull(), // printer | scanner
  configJson: jsonb('config_json').default({}),
});

export type Business = typeof businesses.$inferSelect;
export type NewBusiness = typeof businesses.$inferInsert;
