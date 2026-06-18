import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  text,
} from 'drizzle-orm/pg-core';
import { businesses } from './business.schema';

export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // cash | bank | ewallet | etc
  openingBalance: integer('opening_balance').notNull().default(0),
  balance: integer('balance').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  refType: varchar('ref_type', { length: 100 }),
  refId: uuid('ref_id'),
  date: timestamp('date').notNull().defaultNow(),
  memo: text('memo'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const journalLines = pgTable('journal_lines', {
  id: uuid('id').defaultRandom().primaryKey(),
  journalEntryId: uuid('journal_entry_id')
    .notNull()
    .references(() => journalEntries.id, { onDelete: 'cascade' }),
  accountId: uuid('account_id')
    .notNull()
    .references(() => accounts.id),
  debit: integer('debit').notNull().default(0),
  credit: integer('credit').notNull().default(0),
});

export type Account = typeof accounts.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type JournalLine = typeof journalLines.$inferSelect;
