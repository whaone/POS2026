import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

type BookingReminderJob = { bookingId: string; businessId: string };
type PaymentReminderJob = { purchaseId: string; businessId: string };
type StockAlertJob = { productId: string; qty: number };
type LoyaltyRecalcJob = { customerId: string; businessId: string };

@Processor('booking-reminder')
export class BookingReminderProcessor extends WorkerHost {
  private readonly logger = new Logger(BookingReminderProcessor.name);

  process(job: Job<BookingReminderJob, { sent: boolean }, string>) {
    this.logger.log(`Processing booking reminder for job ${job.id}`);
    const { bookingId, businessId } = job.data;
    this.logger.log(
      `[MOCK] Sent reminder for booking ${bookingId} (Business: ${businessId})`,
    );
    return Promise.resolve({ sent: true });
  }
}

@Processor('payment-reminder')
export class PaymentReminderProcessor extends WorkerHost {
  private readonly logger = new Logger(PaymentReminderProcessor.name);

  process(job: Job<PaymentReminderJob, { checked: boolean }, string>) {
    this.logger.log(`Processing payment reminder for job ${job.id}`);
    this.logger.log(
      `[MOCK] Checked payment for purchase ${job.data.purchaseId}`,
    );
    return Promise.resolve({ checked: true });
  }
}

@Processor('stock-alerts')
export class StockAlertsProcessor extends WorkerHost {
  private readonly logger = new Logger(StockAlertsProcessor.name);

  process(job: Job<StockAlertJob, { processed: boolean }, string>) {
    this.logger.log(`Processing stock alert for job ${job.id}`);
    const { productId, qty } = job.data;
    if (qty <= 5) {
      this.logger.log(
        `[MOCK] Low stock alert sent for product ${productId}. Qty: ${qty}`,
      );
    }
    return Promise.resolve({ processed: true });
  }
}

@Processor('loyalty-recalc')
export class LoyaltyRecalcProcessor extends WorkerHost {
  private readonly logger = new Logger(LoyaltyRecalcProcessor.name);

  process(job: Job<LoyaltyRecalcJob, { updated: boolean }, string>) {
    this.logger.log(`Processing loyalty recalc for job ${job.id}`);
    this.logger.log(
      `[MOCK] Recalculated loyalty points for customer ${job.data.customerId}`,
    );
    return Promise.resolve({ updated: true });
  }
}
