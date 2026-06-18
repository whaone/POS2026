import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateProductDto, CreateProductVariationDto } from '../dto/create-product.dto';
import { UpdateProductDto, UpdateProductVariationDto } from '../dto/update-product.dto';
export declare class ProductsService {
    private readonly db;
    constructor(db: NodePgDatabase);
    createProduct(businessId: string, dto: CreateProductDto): Promise<{
        name: string;
        type: string;
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        brandId: string | null;
        categoryId: string | null;
        unitId: string | null;
        taxId: string | null;
        manageStock: boolean;
        hasExpiry: boolean;
        sku: string;
        barcode: string | null;
    }>;
    findAllProducts(businessId: string): Promise<{
        id: string;
        businessId: string;
        name: string;
        type: string;
        brandId: string | null;
        categoryId: string | null;
        unitId: string | null;
        taxId: string | null;
        manageStock: boolean;
        hasExpiry: boolean;
        sku: string;
        barcode: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findProductById(businessId: string, id: string): Promise<{
        id: string;
        businessId: string;
        name: string;
        type: string;
        brandId: string | null;
        categoryId: string | null;
        unitId: string | null;
        taxId: string | null;
        manageStock: boolean;
        hasExpiry: boolean;
        sku: string;
        barcode: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProduct(businessId: string, id: string, dto: UpdateProductDto): Promise<{
        id: string;
        businessId: string;
        name: string;
        type: string;
        brandId: string | null;
        categoryId: string | null;
        unitId: string | null;
        taxId: string | null;
        manageStock: boolean;
        hasExpiry: boolean;
        sku: string;
        barcode: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    removeProduct(businessId: string, id: string): Promise<void>;
    findProductByBarcode(businessId: string, barcode: string): Promise<{
        id: string;
        businessId: string;
        name: string;
        type: string;
        brandId: string | null;
        categoryId: string | null;
        unitId: string | null;
        taxId: string | null;
        manageStock: boolean;
        hasExpiry: boolean;
        sku: string;
        barcode: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createVariation(dto: CreateProductVariationDto): Promise<{
        name: string;
        id: string;
        sku: string;
        productId: string;
        attributesJson: unknown;
    }>;
    findAllVariations(productId: string): Promise<{
        id: string;
        productId: string;
        name: string;
        sku: string;
        attributesJson: unknown;
    }[]>;
    updateVariation(id: string, dto: UpdateProductVariationDto): Promise<{
        id: string;
        productId: string;
        name: string;
        sku: string;
        attributesJson: unknown;
    }>;
    removeVariation(id: string): Promise<{
        success: boolean;
    }>;
    importCsv(businessId: string, productsData: CreateProductDto[]): Promise<{
        name: string;
        type: string;
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        brandId: string | null;
        categoryId: string | null;
        unitId: string | null;
        taxId: string | null;
        manageStock: boolean;
        hasExpiry: boolean;
        sku: string;
        barcode: string | null;
    }[]>;
    findAllCategories(businessId: string): Promise<{
        id: string;
        businessId: string;
        name: string;
        parentId: string | null;
        createdAt: Date;
    }[]>;
    findAllBrands(businessId: string): Promise<{
        id: string;
        businessId: string;
        name: string;
        createdAt: Date;
    }[]>;
    findAllUnits(businessId: string): Promise<{
        id: string;
        businessId: string;
        name: string;
        shortName: string;
        createdAt: Date;
    }[]>;
    findAllTaxes(businessId: string): Promise<{
        id: string;
        businessId: string;
        name: string;
        rate: string;
        createdAt: Date;
    }[]>;
}
