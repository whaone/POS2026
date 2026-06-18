import { NodePgDatabase } from 'drizzle-orm/node-postgres';
export declare class LoyaltyService {
    private readonly db;
    private readonly POINTS_CONVERSION_RATE;
    constructor(db: NodePgDatabase);
    getBalance(customerId: string): Promise<number>;
    handleTransactionCompleted(payload: {
        saleId: string;
        businessId: string;
        customerId?: string;
        grandTotal: number;
    }): Promise<void>;
    redeemPoints(customerId: string, pointsToRedeem: number, saleId: string): Promise<void>;
}
