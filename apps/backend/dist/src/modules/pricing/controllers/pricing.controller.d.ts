import { PricingService } from '../services/pricing.service';
import type { RequestWithUser } from '../../auth/auth.types';
export declare class PricingController {
    private readonly pricingService;
    constructor(pricingService: PricingService);
    getQuote(productId: string, customerId?: string, qty?: number): Promise<{
        productId: string;
        customerId: string | undefined;
        basePrice: number;
        priceGroupId: string | null;
        qty: number;
        finalPrice: number;
        activeDiscounts: {
            id: string;
            type: string;
            config: unknown;
        }[];
    }>;
    createDiscount(req: RequestWithUser, data: any): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        businessId: string;
        configJson: unknown;
        active: boolean;
        startDate: Date | null;
        endDate: Date | null;
    }>;
    findAllDiscounts(req: RequestWithUser): Promise<{
        id: string;
        businessId: string;
        type: string;
        configJson: unknown;
        startDate: Date | null;
        endDate: Date | null;
        active: boolean;
        createdAt: Date;
    }[]>;
    createMarkdown(req: RequestWithUser, data: any): Promise<{
        id: string;
        createdAt: Date;
        businessId: string;
        configJson: unknown;
        productId: string;
        rule: string;
    }>;
    findAllMarkdowns(req: RequestWithUser): Promise<{
        id: string;
        businessId: string;
        productId: string;
        rule: string;
        configJson: unknown;
        createdAt: Date;
    }[]>;
}
