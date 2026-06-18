import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
} from 'drizzle-orm/pg-core';
import { businesses } from './business.schema';
import { locations } from './location.schema';
import { accounts } from './accounting.schema';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  refreshToken: text('refresh_token'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const expenses = pgTable('expenses', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id),
  category: varchar('category', { length: 255 }).notNull(),
  amount: integer('amount').notNull(),
  accountId: uuid('account_id').references(() => accounts.id),
  date: timestamp('date').defaultNow().notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const payrolls = pgTable('payrolls', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  period: varchar('period', { length: 50 }).notNull(), // YYYY-MM
  amount: integer('amount').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const commissionAgents = pgTable('commission_agents', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  rate: integer('rate').notNull().default(0), // percentage * 100 for precision, e.g. 5.5% = 550
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
