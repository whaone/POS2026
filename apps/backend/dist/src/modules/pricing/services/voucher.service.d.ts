import { NodePgDatabase } from 'drizzle-orm/node-postgres';
interface RedeemVoucherPayload {
    voucherCode: string;
    transactionId: string;
    branchId: string;
    cashierId: string;
    amountUsed: number;
}
export declare class VoucherService {
    private readonly db;
    constructor(db: NodePgDatabase);
    validateVoucher(code: string, purchaseAmount: number): Promise<{
        id: string;
        businessId: string;
        code: string;
        type: string;
        value: number;
        maxDiscount: number | null;
        minPurchase: number;
        branchScope: unknown;
        productScope: unknown;
        startDate: Date | null;
        expiryDate: Date | null;
        status: string;
        isStackable: boolean;
        batchId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    redeemVoucher(payload: RedeemVoucherPayload): Promise<{
        id: string;
        cashierId: string | null;
        voucherId: string;
        transactionId: string;
        branchId: string | null;
        amountUsed: number;
        redeemedAt: Date;
    }>;
    redeemVoucherInTx(tx: NodePgDatabase, voucherId: string, payload: Omit<RedeemVoucherPayload, 'voucherCode'>): Promise<{
        id: string;
        cashierId: string | null;
        voucherId: string;
        transactionId: string;
        branchId: string | null;
        amountUsed: number;
        redeemedAt: Date;
    }>;
}
export {};
