import { EventEmitter2 } from '@nestjs/event-emitter';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CheckoutPayDto } from '../dto/checkout.dto';
import { VoucherService } from '../../pricing/services/voucher.service';
export declare class CheckoutService {
    private readonly db;
    private readonly eventEmitter;
    private readonly voucherService;
    constructor(db: NodePgDatabase, eventEmitter: EventEmitter2, voucherService: VoucherService);
    processPayment(businessId: string, dto: CheckoutPayDto): Promise<{
        id: string;
        businessId: string;
        locationId: string;
        customerId: string | null;
        cashierId: string | null;
        commissionAgentId: string | null;
        subtotal: number;
        taxTotal: number;
        discountTotal: number;
        shipping: number;
        grandTotal: number;
        paidTotal: number;
        status: string;
        shiftId: string | null;
        idempotencyKey: string | null;
        createdAt: Date;
    }>;
}
