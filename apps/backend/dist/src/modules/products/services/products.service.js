"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_module_1 = require("../../../core/database/database.module");
const product_schema_1 = require("../../../db/schema/product.schema");
let ProductsService = class ProductsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async createProduct(businessId, dto) {
        const result = await this.db
            .insert(product_schema_1.products)
            .values({
            businessId,
            ...dto,
        })
            .returning();
        return result[0];
    }
    async findAllProducts(businessId) {
        return this.db
            .select()
            .from(product_schema_1.products)
            .where((0, drizzle_orm_1.eq)(product_schema_1.products.businessId, businessId));
    }
    async findProductById(businessId, id) {
        const result = await this.db
            .select()
            .from(product_schema_1.products)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(product_schema_1.products.businessId, businessId), (0, drizzle_orm_1.eq)(product_schema_1.products.id, id)))
            .limit(1);
        if (!result.length) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        return result[0];
    }
    async updateProduct(businessId, id, dto) {
        await this.findProductById(businessId, id);
        const result = await this.db
            .update(product_schema_1.products)
            .set({ ...dto, updatedAt: new Date() })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(product_schema_1.products.businessId, businessId), (0, drizzle_orm_1.eq)(product_schema_1.products.id, id)))
            .returning();
        return result[0];
    }
    async removeProduct(businessId, id) {
        await this.findProductById(businessId, id);
        await this.db
            .delete(product_schema_1.products)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(product_schema_1.products.businessId, businessId), (0, drizzle_orm_1.eq)(product_schema_1.products.id, id)));
    }
    async findProductByBarcode(businessId, barcode) {
        const result = await this.db
            .select()
            .from(product_schema_1.products)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(product_schema_1.products.businessId, businessId), (0, drizzle_orm_1.eq)(product_schema_1.products.barcode, barcode)))
            .limit(1);
        if (!result.length) {
            throw new common_1.NotFoundException(`Product with barcode ${barcode} not found`);
        }
        return result[0];
    }
    async createVariation(dto) {
        const result = await this.db
            .insert(product_schema_1.productVariations)
            .values(dto)
            .returning();
        return result[0];
    }
    async findAllVariations(productId) {
        return this.db
            .select()
            .from(product_schema_1.productVariations)
            .where((0, drizzle_orm_1.eq)(product_schema_1.productVariations.productId, productId));
    }
    async updateVariation(id, dto) {
        const result = await this.db
            .update(product_schema_1.productVariations)
            .set(dto)
            .where((0, drizzle_orm_1.eq)(product_schema_1.productVariations.id, id))
            .returning();
        if (!result.length) {
            throw new common_1.NotFoundException(`Variation not found`);
        }
        return result[0];
    }
    async removeVariation(id) {
        const result = await this.db
            .delete(product_schema_1.productVariations)
            .where((0, drizzle_orm_1.eq)(product_schema_1.productVariations.id, id))
            .returning();
        if (!result.length) {
            throw new common_1.NotFoundException(`Variation not found`);
        }
        return { success: true };
    }
    async importCsv(businessId, productsData) {
        if (!productsData || productsData.length === 0)
            return [];
        return this.db.transaction(async (tx) => {
            const results = [];
            for (const dto of productsData) {
                const [product] = await tx
                    .insert(product_schema_1.products)
                    .values({ businessId, ...dto })
                    .returning();
                results.push(product);
            }
            return results;
        });
    }
    async findAllCategories(businessId) {
        return this.db
            .select()
            .from(product_schema_1.categories)
            .where((0, drizzle_orm_1.eq)(product_schema_1.categories.businessId, businessId));
    }
    async findAllBrands(businessId) {
        return this.db
            .select()
            .from(product_schema_1.brands)
            .where((0, drizzle_orm_1.eq)(product_schema_1.brands.businessId, businessId));
    }
    async findAllUnits(businessId) {
        return this.db.select().from(product_schema_1.units).where((0, drizzle_orm_1.eq)(product_schema_1.units.businessId, businessId));
    }
    async findAllTaxes(businessId) {
        return this.db.select().from(product_schema_1.taxes).where((0, drizzle_orm_1.eq)(product_schema_1.taxes.businessId, businessId));
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [Function])
], ProductsService);
//# sourceMappingURL=products.service.js.map