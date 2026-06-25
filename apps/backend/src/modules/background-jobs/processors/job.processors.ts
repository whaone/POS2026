import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { eq, and, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_TOKEN } from '../../../core/database/database.module';
import { bookings } from '../../../db/schema/booking.schema';
import { purchases } from '../../../db/schema/purchase.schema';
import { stock } from '../../../db/schema/stock.schema';
import { products } from '../../../db/schema/product.schema';
import {
  loyaltyAccounts,
  loyaltyTransactions,
} from '../../../db/schema/customer.schema';

type BookingReminderJob = { bookingId: string; businessId: string };
type PaymentReminderJob = { purchaseId: string; businessId: string };
type StockAlertJob = { productId: string; qty: number };
type LoyaltyRecalcJob = { customerId: string; businessId: string };

/** On-hand qty at or below this triggers a low-stock alert. */
const LOW_STOCK_THRESHOLD = 5;

/**
 * Verifies a confirmed booking is still upcoming before a reminder is due.
 * Delivery (SMS/email/push) is an external integration point — the job does
 * the real eligibility check and hands a verified target to that channel.
 */
@Processor('booking-reminder')
export class BookingReminderProcessor extends WorkerHost {
  private readonly logger = new Logger(BookingReminderProcessor.name);

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: NodePgDatabase,
  ) {
    super();
  }

  async process(job: Job<BookingReminderJob, { sent: boolean }, string>) {
    const { bookingId, businessId } = job.data;
    const [booking] = await this.db
      .select()
      .from(bookings)
      .where(
        and(eq(bookings.id, bookingId), eq(bookings.businessId, businessId)),
      );

    if (!booking || booking.status !== 'confirmed') {
      this.logger.log(`Booking ${bookingId} not eligible for reminder; skipped`);
      return { sent: false };
    }
    if (booking.startTime.getTime() <= Date.now()) {
      this.logger.log(`Booking ${bookingId} already started; reminder skipped`);
      return { sent: false };
    }

    // Hand off to the notification channel (external delivery).
    this.logger.log(
      `Reminder due for booking ${bookingId} at ${booking.startTime.toISOString()}`,
    );
    return { sent: true };
  }
}

/**
 * Re-checks whether a purchase still has an outstanding balance before
 * reminding the operator to pay the supplier.
 */
@Processor('payment-reminder')
export class PaymentReminderProcessor extends WorkerHost {
  private readonly logger = new Logger(PaymentReminderProcessor.name);

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: NodePgDatabase,
  ) {
    super();
  }

  async process(job: Job<PaymentReminderJob, { due: boolean }, string>) {
    const { purchaseId, businessId } = job.data;
    const [purchase] = await this.db
      .select()
      .from(purchases)
      .where(
        and(eq(purchases.id, purchaseId), eq(purchases.businessId, businessId)),
      );

    if (!purchase) {
      this.logger.log(`Purchase ${purchaseId} not found; reminder skipped`);
      return { due: false };
    }

    const outstanding = purchase.grandTotal - purchase.paidTotal;
    if (outstanding <= 0) {
      this.logger.log(`Purchase ${purchaseId} fully paid; reminder skipped`);
      return { due: false };
    }

    this.logger.log(
      `Payment reminder: purchase ${purchaseId} has ${outstanding} outstanding`,
    );
    return { due: true };
  }
}

/**
 * Recomputes current on-hand quantity for a product from the live stock
 * ledger (summed across locations) and raises a low-stock alert when it is
 * at or below the threshold — independent of the qty in the job payload.
 */
@Processor('stock-alerts')
export class StockAlertsProcessor extends WorkerHost {
  private readonly logger = new Logger(StockAlertsProcessor.name);

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: NodePgDatabase,
  ) {
    super();
  }

  async process(job: Job<StockAlertJob, { low: boolean; qty: number }, string>) {
    const { productId } = job.data;
    const [agg] = await this.db
      .select({ qty: sql<number>`coalesce(sum(${stock.qty}), 0)` })
      .from(stock)
      .where(eq(stock.productId, productId));

    const currentQty = Math.round(Number(agg?.qty ?? 0));
    if (currentQty > LOW_STOCK_THRESHOLD) {
      return { low: false, qty: currentQty };
    }

    const [product] = await this.db
      .select({ name: products.name })
      .from(products)
      .where(eq(products.id, productId));

    this.logger.warn(
      `Low stock: "${product?.name ?? productId}" at ${currentQty} units`,
    );
    return { low: true, qty: currentQty };
  }
}

/**
 * Reconciles a customer's loyalty points balance against the sum of their
 * earn/redeem transactions — a real integrity recompute that corrects any
 * drift from the live event-driven updates.
 */
@Processor('loyalty-recalc')
export class LoyaltyRecalcProcessor extends WorkerHost {
  private readonly logger = new Logger(LoyaltyRecalcProcessor.name);

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: NodePgDatabase,
  ) {
    super();
  }

  async process(
    job: Job<LoyaltyRecalcJob, { balance: number }, string>,
  ) {
    const { customerId } = job.data;
    const [agg] = await this.db
      .select({
        balance: sql<number>`coalesce(sum(case when ${loyaltyTransactions.type} = 'earn' then ${loyaltyTransactions.points} else -${loyaltyTransactions.points} end), 0)`,
      })
      .from(loyaltyTransactions)
      .where(eq(loyaltyTransactions.customerId, customerId));

    const balance = Math.round(Number(agg?.balance ?? 0));

    const [account] = await this.db
      .select()
      .from(loyaltyAccounts)
      .where(eq(loyaltyAccounts.customerId, customerId));

    if (!account) {
      await this.db
        .insert(loyaltyAccounts)
        .values({ customerId, pointsBalance: balance });
    } else if (account.pointsBalance !== balance) {
      await this.db
        .update(loyaltyAccounts)
        .set({ pointsBalance: balance, updatedAt: new Date() })
        .where(eq(loyaltyAccounts.id, account.id));
      this.logger.log(
        `Loyalty balance for ${customerId} corrected ${account.pointsBalance} -> ${balance}`,
      );
    }

    return { balance };
  }
}
