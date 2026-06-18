import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { businesses } from './business.schema';
import { locations } from './location.schema';
import { customers } from './customer.schema';
import { products, productVariations } from './product.schema';

export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customers.id),
  type: varchar('type', { length: 50 }).notNull(), // table | staff | slot
  resourceId: varchar('resource_id', { length: 255 }), // can be table number, staff id, or slot name
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('confirmed'), // confirmed | collected | cancelled
  dpAmount: integer('dp_amount').notNull().default(0), // minor-unit
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const preorders = pgTable('preorders', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customers.id),
  source: varchar('source', { length: 50 }).notNull().default('pos'), // external | pos
  pickupCode: varchar('pickup_code', { length: 100 }),
  status: varchar('status', { length: 50 }).notNull().default('reserved'), // reserved | collected | cancelled
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const preorderItems = pgTable('preorder_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  preorderId: uuid('preorder_id')
    .notNull()
    .references(() => preorders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  variationId: uuid('variation_id').references(() => productVariations.id),
  qty: integer('qty').notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type Preorder = typeof preorders.$inferSelect;
export type PreorderItem = typeof preorderItems.$inferSelect;
