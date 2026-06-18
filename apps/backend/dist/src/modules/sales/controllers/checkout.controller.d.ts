import { CheckoutService } from '../services/checkout.service';
import { CheckoutPayDto } from '../dto/checkout.dto';
import type { JwtPayload } from '../../auth/auth.types';
export declare class CheckoutController {
    private readonly checkoutService;
    constructor(checkoutService: CheckoutService);
    pay(user: JwtPayload, dto: CheckoutPayDto): Promise<{
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
