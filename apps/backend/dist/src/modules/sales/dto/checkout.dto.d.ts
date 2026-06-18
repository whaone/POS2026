export declare enum PaymentMethod {
    CASH = "cash",
    QRIS = "qris",
    CARD = "card",
    CHEQUE = "cheque",
    TRANSFER = "transfer",
    VOUCHER = "voucher",
    POINTS = "points"
}
export declare class PaymentDto {
    method: PaymentMethod;
    amount: number;
    accountId?: string;
    ref?: string;
    voucherCode?: string;
}
export declare class CheckoutPayDto {
    saleId: string;
    idempotencyKey: string;
    payments: PaymentDto[];
}
