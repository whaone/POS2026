import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
type BookingReminderJob = {
    bookingId: string;
    businessId: string;
};
type PaymentReminderJob = {
    purchaseId: string;
    businessId: string;
};
type StockAlertJob = {
    productId: string;
    qty: number;
};
type LoyaltyRecalcJob = {
    customerId: string;
    businessId: string;
};
export declare class BookingReminderProcessor extends WorkerHost {
    private readonly logger;
    process(job: Job<BookingReminderJob, {
        sent: boolean;
    }, string>): Promise<{
        sent: boolean;
    }>;
}
export declare class PaymentReminderProcessor extends WorkerHost {
    private readonly logger;
    process(job: Job<PaymentReminderJob, {
        checked: boolean;
    }, string>): Promise<{
        checked: boolean;
    }>;
}
export declare class StockAlertsProcessor extends WorkerHost {
    private readonly logger;
    process(job: Job<StockAlertJob, {
        processed: boolean;
    }, string>): Promise<{
        processed: boolean;
    }>;
}
export declare class LoyaltyRecalcProcessor extends WorkerHost {
    private readonly logger;
    process(job: Job<LoyaltyRecalcJob, {
        updated: boolean;
    }, string>): Promise<{
        updated: boolean;
    }>;
}
export {};
