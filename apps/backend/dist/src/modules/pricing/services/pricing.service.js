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
exports.PricingService = void 0;
const common_1 = require("@nestjs/common");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const drizzle_orm_1 = require("drizzle-orm");
const pricing_schema_1 = require("../../../db/schema/pricing.schema");
const product_schema_1 = require("../../../db/schema/product.schema");
const customer_schema_1 = require("../../../db/schema/customer.schema");
let PricingService = class PricingService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getQuote(productId, customerId, qty = 1) {
        const [product] = await this.db
            .select()
            .from(product_schema_1.products)
            .where((0, drizzle_orm_1.eq)(product_schema_1.products.id, productId));
        if (!product) {
            throw new common_1.NotFoundException(`Product ${productId} not found`);
        }
        let basePrice = 0;
        let priceGroupId = null;
        if (customerId) {
            const [customer] = await this.db
                .select()
                .from(customer_schema_1.customers)
                .where((0, drizzle_orm_1.eq)(customer_schema_1.customers.id, customerId));
            if (customer && customer.priceGroupId) {
                priceGroupId = customer.priceGroupId;
            }
        }
        if (priceGroupId) {
            const [priceRecord] = await this.db
                .select()
                .from(product_schema_1.productPrices)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(product_schema_1.productPrices.productId, productId), (0, drizzle_orm_1.eq)(product_schema_1.productPrices.priceGroupId, priceGroupId)));
            if (priceRecord) {
                basePrice = priceRecord.price;
            }
        }
        const activeMarkdown = await this.db
            .select()
            .from(pricing_schema_1.markdowns)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(pricing_schema_1.markdowns.productId, productId), (0, drizzle_orm_1.eq)(pricing_schema_1.markdowns.rule, 'hour')));
        let finalPrice = basePrice * qty;
        if (activeMarkdown.length > 0) {
            const config = activeMarkdown[0].configJson;
            if (config && config.discountPercent) {
                finalPrice = finalPrice * (1 - config.discountPercent / 100);
            }
        }
        const activeDiscounts = await this.db
            .select()
            .from(pricing_schema_1.discounts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(pricing_schema_1.discounts.active, true)));
        return {
            productId,
            customerId,
            basePrice,
            priceGroupId,
            qty,
            finalPrice: Math.round(finalPrice),
            activeDiscounts: activeDiscounts.map((d) => ({
                id: d.id,
                type: d.type,
                config: d.configJson,
            })),
        };
    }
    async createDiscount(businessId, data) {
        const [discount] = await this.db
            .insert(pricing_schema_1.discounts)
            .values({
            businessId,
            type: data.type,
            configJson: data.configJson,
            startDate: data.startDate,
            endDate: data.endDate,
            active: data.active ?? true,
        })
            .returning();
        return discount;
    }
    async findAllDiscounts(businessId) {
        return this.db
            .select()
            .from(pricing_schema_1.discounts)
            .where((0, drizzle_orm_1.eq)(pricing_schema_1.discounts.businessId, businessId));
    }
    async createMarkdown(businessId, data) {
        const [markdown] = await this.db
            .insert(pricing_schema_1.markdowns)
            .values({
            businessId,
            productId: data.productId,
            rule: data.rule,
            configJson: data.configJson,
        })
            .returning();
        return markdown;
    }
    async findAllMarkdowns(businessId) {
        return this.db
            .select()
            .from(pricing_schema_1.markdowns)
            .where((0, drizzle_orm_1.eq)(pricing_schema_1.markdowns.businessId, businessId));
    }
};
exports.PricingService = PricingService;
exports.PricingService = PricingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DB_CLIENT')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], PricingService);
//# sourceMappingURL=pricing.service.js.map