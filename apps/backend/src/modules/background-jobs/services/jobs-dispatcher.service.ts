import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class JobsDispatcherService {
  private readonly logger = new Logger(JobsDispatcherService.name);

  constructor(
    @InjectQueue('booking-reminder') private bookingQueue: Queue,
    @InjectQueue('payment-reminder') private paymentQueue: Queue,
    @InjectQueue('stock-alerts') private stockQueue: Queue,
    @InjectQueue('report-generation') private reportQueue: Queue,
    @InjectQueue('loyalty-recalc') private loyaltyQueue: Queue,
  ) {}

  @OnEvent('booking.created')
  async handleBookingCreated(payload: {
    bookingId: string;
    businessId: string;
    startTime: Date;
  }) {
    // Schedule reminder 24 hours before start time
    const reminderTime = new Date(payload.startTime);
    reminderTime.setHours(reminderTime.getHours() - 24);

    const delay = reminderTime.getTime() - Date.now();

    if (delay > 0) {
      await this.bookingQueue.add('send-reminder', payload, { delay });
      this.logger.log(`Scheduled booking reminder for ${payload.bookingId}`);
    }
  }

  @OnEvent('purchase.received')
  async handlePurchaseReceived(payload: {
    purchaseId: string;
    businessId: string;
    grandTotal: number;
  }) {
    // Schedule a mock payment reminder 7 days later
    await this.paymentQueue.add('check-payment-due', payload, {
      delay: 7 * 24 * 60 * 60 * 1000,
    });
  }

  @OnEvent('stock.changed')
  async handleStockChanged(payload: {
    businessId: string;
    locationId: string;
    productId: string;
    qty: number;
  }) {
    // Trigger stock check immediately
    await this.stockQueue.add('check-low-stock', payload);
  }

  @OnEvent('transaction.completed')
  async handleTransactionCompleted(payload: {
    saleId: string;
    customerId?: string;
    businessId: string;
  }) {
    if (payload.customerId) {
      await this.loyaltyQueue.add('recalc-points', {
        customerId: payload.customerId,
        businessId: payload.businessId,
      });
    }
  }
}
