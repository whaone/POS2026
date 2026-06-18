import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';

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

export type Business = typeof businesses.$inferSelect;
export type NewBusiness = typeof businesses.$inferInsert;
