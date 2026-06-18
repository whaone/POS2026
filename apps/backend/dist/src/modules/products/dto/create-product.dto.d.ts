export declare class CreateProductDto {
    name: string;
    type?: string;
    brandId?: string;
    categoryId?: string;
    unitId?: string;
    taxId?: string;
    manageStock?: boolean;
    hasExpiry?: boolean;
    sku: string;
    barcode?: string;
}
export declare class CreateProductVariationDto {
    productId: string;
    name: string;
    sku: string;
    attributesJson?: Record<string, any>;
}
