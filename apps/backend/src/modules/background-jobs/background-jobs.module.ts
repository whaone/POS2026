import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobsDispatcherService } from './services/jobs-dispatcher.service';
import {
  BookingReminderProcessor,
  PaymentReminderProcessor,
  StockAlertsProcessor,
  LoyaltyRecalcProcessor,
} from './processors/mock.processors';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'booking-reminder' },
      { name: 'payment-reminder' },
      { name: 'stock-alerts' },
      { name: 'report-generation' },
      { name: 'loyalty-recalc' },
    ),
  ],
  providers: [
    JobsDispatcherService,
    BookingReminderProcessor,
    PaymentReminderProcessor,
    StockAlertsProcessor,
    LoyaltyRecalcProcessor,
  ],
  exports: [JobsDispatcherService],
})
export class BackgroundJobsModule {}
