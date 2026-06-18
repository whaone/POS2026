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
import { contacts } from './contact.schema';

export const purchases = pgTable('purchases', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id),
  supplierId: uuid('supplier_id')
    .notNull()
    .references(() => contacts.id),
  subtotal: integer('subtotal').notNull().default(0),
  taxTotal: integer('tax_total').notNull().default(0),
  discount: integer('discount').notNull().default(0),
  shipping: integer('shipping').notNull().default(0),
  grandTotal: integer('grand_total').notNull().default(0),
  paidTotal: integer('paid_total').notNull().default(0),
  status: varchar('status', { length: 50 }).notNull().default('credit'),
  documentUrl: varchar('document_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const purchaseItems = pgTable('purchase_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  purchaseId: uuid('purchase_id')
    .notNull()
    .references(() => purchases.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  variationId: uuid('variation_id').references(() => productVariations.id),
  qty: integer('qty').notNull(),
  cost: integer('cost').notNull().default(0),
  tax: integer('tax').notNull().default(0),
  lotNumber: varchar('lot_number', { length: 100 }),
  expiryDate: timestamp('expiry_date'),
});

export const purchasePayments = pgTable('purchase_payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  purchaseId: uuid('purchase_id')
    .notNull()
    .references(() => purchases.id, { onDelete: 'cascade' }),
  method: varchar('method', { length: 50 }).notNull(),
  amount: integer('amount').notNull(),
  accountId: uuid('account_id'),
  paidAt: timestamp('paid_at').defaultNow().notNull(),
});

export const purchaseReturns = pgTable('purchase_returns', {
  id: uuid('id').defaultRandom().primaryKey(),
  purchaseId: uuid('purchase_id')
    .notNull()
    .references(() => purchases.id, { onDelete: 'cascade' }),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id),
  reason: varchar('reason', { length: 255 }),
  amount: integer('amount').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const purchaseReturnItems = pgTable('purchase_return_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  returnId: uuid('return_id')
    .notNull()
    .references(() => purchaseReturns.id, { onDelete: 'cascade' }),
  purchaseItemId: uuid('purchase_item_id')
    .notNull()
    .references(() => purchaseItems.id, { onDelete: 'cascade' }),
  qty: integer('qty').notNull(),
});

export type Purchase = typeof purchases.$inferSelect;
export type PurchaseItem = typeof purchaseItems.$inferSelect;
export type PurchasePayment = typeof purchasePayments.$inferSelect;
export type PurchaseReturn = typeof purchaseReturns.$inferSelect;
export type PurchaseReturnItem = typeof purchaseReturnItems.$inferSelect;
