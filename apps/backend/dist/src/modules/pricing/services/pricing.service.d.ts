import { NodePgDatabase } from 'drizzle-orm/node-postgres';
export declare class PricingService {
    private readonly db;
    constructor(db: NodePgDatabase);
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
    createDiscount(businessId: string, data: any): Promise<{
        type: string;
        id: string;
        businessId: string;
        active: boolean;
        createdAt: Date;
        configJson: unknown;
        startDate: Date | null;
        endDate: Date | null;
    }>;
    findAllDiscounts(businessId: string): Promise<{
        id: string;
        businessId: string;
        type: string;
        configJson: unknown;
        startDate: Date | null;
        endDate: Date | null;
        active: boolean;
        createdAt: Date;
    }[]>;
    createMarkdown(businessId: string, data: any): Promise<{
        id: string;
        businessId: string;
        createdAt: Date;
        productId: string;
        configJson: unknown;
        rule: string;
    }>;
    findAllMarkdowns(businessId: string): Promise<{
        id: string;
        businessId: string;
        productId: string;
        rule: string;
        configJson: unknown;
        createdAt: Date;
    }[]>;
}
