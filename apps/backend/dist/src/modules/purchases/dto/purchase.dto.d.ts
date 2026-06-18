declare enum PaymentMethod {
    CASH = "cash",
    TRANSFER = "transfer",
    CHEQUE = "cheque"
}
export declare class PurchaseItemDto {
    productId: string;
    variationId?: string;
    qty: number;
    cost: number;
    tax?: number;
    lotNumber?: string;
    expiryDate?: Date;
}
export declare class CreatePurchaseDto {
    locationId: string;
    supplierId: string;
    subtotal: number;
    taxTotal: number;
    discount: number;
    shipping: number;
    grandTotal: number;
    items: PurchaseItemDto[];
}
declare const UpdatePurchaseDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreatePurchaseDto>>;
export declare class UpdatePurchaseDto extends UpdatePurchaseDto_base {
}
export declare class PurchasePaymentDto {
    method: PaymentMethod;
    amount: number;
    accountId?: string;
}
export declare class PurchaseReturnItemDto {
    purchaseItemId: string;
    productId: string;
    qty: number;
}
export declare class PurchaseReturnDto {
    reason: string;
    amount: number;
    items: PurchaseReturnItemDto[];
}
export {};
