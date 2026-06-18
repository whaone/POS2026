import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { businesses } from './business.schema';

export const contacts = pgTable('contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  payTermDays: integer('pay_term_days'),
  creditLimit: integer('credit_limit').notNull().default(0),
  openingBalance: integer('opening_balance').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const contactLedgers = pgTable('contact_ledgers', {
  id: uuid('id').defaultRandom().primaryKey(),
  contactId: uuid('contact_id')
    .notNull()
    .references(() => contacts.id, { onDelete: 'cascade' }),
  refType: varchar('ref_type', { length: 50 }).notNull(),
  refId: uuid('ref_id'),
  debit: integer('debit').notNull().default(0),
  credit: integer('credit').notNull().default(0),
  balance: integer('balance').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type ContactLedger = typeof contactLedgers.$inferSelect;
