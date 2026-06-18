import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core';
import { businesses } from './business.schema';
import { sellingPriceGroups } from './product.schema';

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  category: varchar('category', { length: 50 }).notNull().default('retail'),
  priceGroupId: uuid('price_group_id').references(() => sellingPriceGroups.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const loyaltyAccounts = pgTable('loyalty_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customers.id, { onDelete: 'cascade' }),
  pointsBalance: integer('points_balance').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const loyaltyTransactions = pgTable('loyalty_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customers.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // earn | redeem
  points: integer('points').notNull(),
  saleId: uuid('sale_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const memberships = pgTable('memberships', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  rulesJson: jsonb('rules_json'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type LoyaltyAccount = typeof loyaltyAccounts.$inferSelect;
export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
