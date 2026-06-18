declare enum AdjustmentType {
    INCREASE = "increase",
    DECREASE = "decrease"
}
export declare class StockItemDto {
    productId: string;
    variationId?: string;
    qty: number;
}
export declare class StockAdjustmentDto {
    locationId: string;
    type: AdjustmentType;
    reason?: string;
    recoveryAmount?: number;
    items: StockItemDto[];
}
export declare class StockTransferDto {
    fromLocationId: string;
    toLocationId: string;
    items: StockItemDto[];
}
export {};
