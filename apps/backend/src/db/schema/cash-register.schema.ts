import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { businesses } from './business.schema';
import { locations } from './location.schema';

export const shifts = pgTable('shifts', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id),
  cashierId: uuid('cashier_id').notNull(),
  openingBalance: integer('opening_balance').notNull().default(0),
  closingCounted: integer('closing_counted'),
  systemCash: integer('system_cash').notNull().default(0),
  difference: integer('difference'),
  status: varchar('status', { length: 50 }).notNull().default('open'), // open | closed
  openedAt: timestamp('opened_at').defaultNow().notNull(),
  closedAt: timestamp('closed_at'),
});

export const cashMovements = pgTable('cash_movements', {
  id: uuid('id').defaultRandom().primaryKey(),
  shiftId: uuid('shift_id')
    .notNull()
    .references(() => shifts.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // in | out | sale | refund | expense
  amount: integer('amount').notNull(),
  ref: varchar('ref', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Shift = typeof shifts.$inferSelect;
export type CashMovement = typeof cashMovements.$inferSelect;
