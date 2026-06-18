import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { businesses } from './business.schema';
import { locations } from './location.schema';
import { products, productVariations } from './product.schema';

export const stock = pgTable('stock', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id),
  productId: uuid('product_id').references(() => products.id),
  variationId: uuid('variation_id').references(() => productVariations.id),
  qty: integer('qty').notNull().default(0),
  qtyHeld: integer('qty_held').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const stockSerials = pgTable('stock_serials', {
  id: uuid('id').defaultRandom().primaryKey(),
  stockId: uuid('stock_id')
    .notNull()
    .references(() => stock.id, { onDelete: 'cascade' }),
  imeiSerial: varchar('imei_serial', { length: 100 }),
  lotNumber: varchar('lot_number', { length: 100 }),
  expiryDate: timestamp('expiry_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const stockAdjustments = pgTable('stock_adjustments', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id),
  type: varchar('type', { length: 50 }).notNull(),
  reason: varchar('reason', { length: 255 }),
  recoveryAmount: integer('recovery_amount').notNull().default(0),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const stockAdjustmentItems = pgTable('stock_adjustment_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  adjustmentId: uuid('adjustment_id')
    .notNull()
    .references(() => stockAdjustments.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => products.id),
  variationId: uuid('variation_id').references(() => productVariations.id),
  qty: integer('qty').notNull(),
});

export const stockTransfers = pgTable('stock_transfers', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id),
  fromLocationId: uuid('from_location_id')
    .notNull()
    .references(() => locations.id),
  toLocationId: uuid('to_location_id')
    .notNull()
    .references(() => locations.id),
  status: varchar('status', { length: 50 }).notNull().default('in_transit'),
  shippingCharge: integer('shipping_charge').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  receivedAt: timestamp('received_at'),
});

export const stockTransferItems = pgTable('stock_transfer_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  transferId: uuid('transfer_id')
    .notNull()
    .references(() => stockTransfers.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => products.id),
  variationId: uuid('variation_id').references(() => productVariations.id),
  qty: integer('qty').notNull(),
});
