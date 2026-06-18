export declare class ValidateVoucherDto {
    code: string;
    purchaseAmount: number;
}
export declare class RedeemVoucherDto {
    voucherCode: string;
    transactionId: string;
    branchId: string;
    cashierId: string;
    amountUsed: number;
}
