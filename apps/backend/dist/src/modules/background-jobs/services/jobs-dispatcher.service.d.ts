import { Queue } from 'bullmq';
export declare class JobsDispatcherService {
    private bookingQueue;
    private paymentQueue;
    private stockQueue;
    private reportQueue;
    private loyaltyQueue;
    private readonly logger;
    constructor(bookingQueue: Queue, paymentQueue: Queue, stockQueue: Queue, reportQueue: Queue, loyaltyQueue: Queue);
    handleBookingCreated(payload: {
        bookingId: string;
        businessId: string;
        startTime: Date;
    }): Promise<void>;
    handlePurchaseReceived(payload: {
        purchaseId: string;
        businessId: string;
        grandTotal: number;
    }): Promise<void>;
    handleStockChanged(payload: {
        businessId: string;
        locationId: string;
        productId: string;
        qty: number;
    }): Promise<void>;
    handleTransactionCompleted(payload: {
        saleId: string;
        customerId?: string;
        businessId: string;
    }): Promise<void>;
}
