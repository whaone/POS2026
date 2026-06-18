import { VoucherService } from '../services/voucher.service';
import { ValidateVoucherDto, RedeemVoucherDto } from '../dto/voucher.dto';
export declare class VoucherController {
    private readonly voucherService;
    constructor(voucherService: VoucherService);
    validate(validateDto: ValidateVoucherDto): Promise<{
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
    redeem(redeemDto: RedeemVoucherDto): Promise<{
        id: string;
        cashierId: string | null;
        voucherId: string;
        transactionId: string;
        branchId: string | null;
        amountUsed: number;
        redeemedAt: Date;
    }>;
}
