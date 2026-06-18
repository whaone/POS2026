import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';
import { businesses } from './business.schema';
import { products } from './product.schema';
import { locations } from './location.schema';

export const discounts = pgTable('discounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  configJson: jsonb('config_json').notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const markdowns = pgTable('markdowns', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  rule: varchar('rule', { length: 50 }).notNull(),
  configJson: jsonb('config_json').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const vouchers = pgTable('vouchers', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 100 }).notNull().unique(),
  type: varchar('type', { length: 50 }).notNull(),
  value: integer('value').notNull(),
  maxDiscount: integer('max_discount'),
  minPurchase: integer('min_purchase').notNull().default(0),
  branchScope: jsonb('branch_scope'),
  productScope: jsonb('product_scope'),
  startDate: timestamp('start_date'),
  expiryDate: timestamp('expiry_date'),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  isStackable: boolean('is_stackable').notNull().default(false),
  batchId: varchar('batch_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const voucherRedemptions = pgTable('voucher_redemptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  voucherId: uuid('voucher_id')
    .notNull()
    .unique()
    .references(() => vouchers.id, { onDelete: 'cascade' }),
  transactionId: uuid('transaction_id').notNull(),
  branchId: uuid('branch_id').references(() => locations.id),
  cashierId: uuid('cashier_id'),
  amountUsed: integer('amount_used').notNull(),
  redeemedAt: timestamp('redeemed_at').defaultNow().notNull(),
});

export type Discount = typeof discounts.$inferSelect;
export type Markdown = typeof markdowns.$inferSelect;
export type Voucher = typeof vouchers.$inferSelect;
export type VoucherRedemption = typeof voucherRedemptions.$inferSelect;
