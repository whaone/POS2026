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

export const sales = pgTable('sales', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id),
  customerId: uuid('customer_id'),
  cashierId: uuid('cashier_id'),
  commissionAgentId: uuid('commission_agent_id'),
  subtotal: integer('subtotal').notNull().default(0), // minor-unit integer
  taxTotal: integer('tax_total').notNull().default(0),
  discountTotal: integer('discount_total').notNull().default(0),
  shipping: integer('shipping').notNull().default(0),
  grandTotal: integer('grand_total').notNull().default(0),
  paidTotal: integer('paid_total').notNull().default(0),
  status: varchar('status', { length: 50 }).notNull().default('held'), // held | paid | partial | credit
  shiftId: uuid('shift_id'),
  idempotencyKey: varchar('idempotency_key', { length: 255 }).unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const saleItems = pgTable('sale_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  saleId: uuid('sale_id')
    .notNull()
    .references(() => sales.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => products.id),
  variationId: uuid('variation_id').references(() => productVariations.id),
  qty: integer('qty').notNull(),
  unitPrice: integer('unit_price').notNull(), // minor-unit integer
  discount: integer('discount').notNull().default(0),
  tax: integer('tax').notNull().default(0),
  lineTotal: integer('line_total').notNull().default(0),
});

export const salePayments = pgTable('sale_payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  saleId: uuid('sale_id')
    .notNull()
    .references(() => sales.id, { onDelete: 'cascade' }),
  method: varchar('method', { length: 50 }).notNull(), // cash | qris | card | cheque | transfer | voucher | points
  amount: integer('amount').notNull(),
  accountId: uuid('account_id'),
  ref: varchar('ref', { length: 255 }),
});

export type Sale = typeof sales.$inferSelect;
export type SaleItem = typeof saleItems.$inferSelect;
export type SalePayment = typeof salePayments.$inferSelect;

// F1-TAB-01: Tab transaksi multi-pelanggan (maks 10 per shift)
export const transactionTabs = pgTable('transaction_tabs', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id),
  shiftId: uuid('shift_id'),
  cashierId: uuid('cashier_id'),
  customerId: uuid('customer_id'),
  tabIndex: integer('tab_index').notNull(), // 1..10
  label: varchar('label', { length: 100 }),
  status: varchar('status', { length: 50 }).notNull().default('active'), // active | on_hold
  cartJson: varchar('cart_json'),
  itemCount: integer('item_count').notNull().default(0),
  subtotalAmount: integer('subtotal_amount').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  heldAt: timestamp('held_at'),
});

// F1-TAB-04: Parkir tagihan jangka panjang / lintas sesi
export const heldCarts = pgTable('held_carts', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id),
  cashierId: uuid('cashier_id'),
  customerId: uuid('customer_id'),
  cartJson: varchar('cart_json'),
  sourceTabId: uuid('source_tab_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type TransactionTab = typeof transactionTabs.$inferSelect;
export type HeldCart = typeof heldCarts.$inferSelect;
