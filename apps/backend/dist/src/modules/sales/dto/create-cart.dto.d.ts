export declare class CartItemDto {
    productId?: string;
    barcode?: string;
    variationId?: string;
    qty: number;
    unitPrice: number;
    discount?: number;
    tax?: number;
}
export declare class CreateCartDto {
    saleId?: string;
    customerId?: string;
    items?: CartItemDto[];
}
