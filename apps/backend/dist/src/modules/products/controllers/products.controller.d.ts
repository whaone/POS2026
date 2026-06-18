import { ProductsService } from '../services/products.service';
import type { JwtPayload } from '../../auth/auth.types';
import { CreateProductDto, CreateProductVariationDto } from '../dto/create-product.dto';
import { UpdateProductDto, UpdateProductVariationDto } from '../dto/update-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    createProduct(user: JwtPayload, dto: CreateProductDto): Promise<{
        name: string;
        type: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        brandId: string | null;
        categoryId: string | null;
        unitId: string | null;
        taxId: string | null;
        manageStock: boolean;
        hasExpiry: boolean;
        sku: string;
        barcode: string | null;
    }>;
    findAllProducts(user: JwtPayload): Promise<{
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
    findProductById(user: JwtPayload, id: string): Promise<{
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
    updateProduct(user: JwtPayload, id: string, dto: UpdateProductDto): Promise<{
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
    removeProduct(user: JwtPayload, id: string): Promise<void>;
    findByBarcode(user: JwtPayload, code: string): Promise<{
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
    importProducts(user: JwtPayload, productsData: CreateProductDto[]): Promise<{
        name: string;
        type: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        brandId: string | null;
        categoryId: string | null;
        unitId: string | null;
        taxId: string | null;
        manageStock: boolean;
        hasExpiry: boolean;
        sku: string;
        barcode: string | null;
    }[]>;
    printBarcodes(user: JwtPayload, payload: {
        productId: string;
        variationId?: string;
        qty: number;
    }[]): {
        success: boolean;
        message: string;
        jobs: {
            productId: string;
            variationId?: string;
            qty: number;
        }[];
    };
    findAllCategories(user: JwtPayload): Promise<{
        id: string;
        businessId: string;
        name: string;
        parentId: string | null;
        createdAt: Date;
    }[]>;
    findAllBrands(user: JwtPayload): Promise<{
        id: string;
        businessId: string;
        name: string;
        createdAt: Date;
    }[]>;
    findAllUnits(user: JwtPayload): Promise<{
        id: string;
        businessId: string;
        name: string;
        shortName: string;
        createdAt: Date;
    }[]>;
    findAllTaxes(user: JwtPayload): Promise<{
        id: string;
        businessId: string;
        name: string;
        rate: string;
        createdAt: Date;
    }[]>;
}
