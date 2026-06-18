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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_module_1 = require("../../../core/database/database.module");
const sales_schema_1 = require("../../../db/schema/sales.schema");
const product_schema_1 = require("../../../db/schema/product.schema");
let CartService = class CartService {
    db;
    constructor(db) {
        this.db = db;
    }
    async createOrUpdateCart(businessId, locationId, cashierId, dto) {
        if (dto.saleId) {
            return this.updateCart(businessId, locationId, cashierId, dto);
        }
        return this.createCart(businessId, locationId, cashierId, dto);
    }
    async createCart(businessId, locationId, cashierId, dto) {
        const resolvedItems = await this.resolveItems(businessId, dto.items || []);
        const totals = this.calculateTotals(resolvedItems);
        const [newSale] = await this.db
            .insert(sales_schema_1.sales)
            .values({
            businessId,
            locationId,
            customerId: dto.customerId,
            cashierId,
            subtotal: totals.subtotal,
            taxTotal: totals.taxTotal,
            discountTotal: totals.discountTotal,
            grandTotal: totals.grandTotal,
            status: 'held',
        })
            .returning();
        if (resolvedItems.length > 0) {
            const items = resolvedItems.map((item) => ({
                saleId: newSale.id,
                productId: item.productId,
                variationId: item.variationId,
                qty: item.qty,
                unitPrice: item.unitPrice,
                discount: item.discount || 0,
                tax: item.tax || 0,
                lineTotal: item.unitPrice * item.qty - (item.discount || 0) + (item.tax || 0),
            }));
            await this.db.insert(sales_schema_1.saleItems).values(items);
        }
        return newSale;
    }
    async updateCart(businessId, locationId, cashierId, dto) {
        const [existing] = await this.db
            .select()
            .from(sales_schema_1.sales)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(sales_schema_1.sales.id, dto.saleId), (0, drizzle_orm_1.eq)(sales_schema_1.sales.businessId, businessId)))
            .limit(1);
        if (!existing) {
            throw new common_1.NotFoundException(`Sale ${dto.saleId} not found`);
        }
        await this.db.delete(sales_schema_1.saleItems).where((0, drizzle_orm_1.eq)(sales_schema_1.saleItems.saleId, dto.saleId));
        const resolvedItems = await this.resolveItems(businessId, dto.items || []);
        const totals = this.calculateTotals(resolvedItems);
        await this.db
            .update(sales_schema_1.sales)
            .set({
            subtotal: totals.subtotal,
            taxTotal: totals.taxTotal,
            discountTotal: totals.discountTotal,
            grandTotal: totals.grandTotal,
            customerId: dto.customerId,
        })
            .where((0, drizzle_orm_1.eq)(sales_schema_1.sales.id, dto.saleId));
        if (resolvedItems.length > 0) {
            const items = resolvedItems.map((item) => ({
                saleId: dto.saleId,
                productId: item.productId,
                variationId: item.variationId,
                qty: item.qty,
                unitPrice: item.unitPrice,
                discount: item.discount || 0,
                tax: item.tax || 0,
                lineTotal: item.unitPrice * item.qty - (item.discount || 0) + (item.tax || 0),
            }));
            await this.db.insert(sales_schema_1.saleItems).values(items);
        }
        const [updated] = await this.db
            .select()
            .from(sales_schema_1.sales)
            .where((0, drizzle_orm_1.eq)(sales_schema_1.sales.id, dto.saleId))
            .limit(1);
        return updated;
    }
    calculateTotals(items) {
        let subtotal = 0;
        let taxTotal = 0;
        let discountTotal = 0;
        for (const item of items) {
            const lineSubtotal = item.unitPrice * item.qty;
            const lineDiscount = item.discount || 0;
            const lineTax = item.tax || 0;
            subtotal += lineSubtotal;
            taxTotal += lineTax;
            discountTotal += lineDiscount;
        }
        const grandTotal = subtotal - discountTotal + taxTotal;
        return { subtotal, taxTotal, discountTotal, grandTotal };
    }
    async getCart(businessId, saleId) {
        const [sale] = await this.db
            .select()
            .from(sales_schema_1.sales)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(sales_schema_1.sales.id, saleId), (0, drizzle_orm_1.eq)(sales_schema_1.sales.businessId, businessId)))
            .limit(1);
        if (!sale) {
            throw new common_1.NotFoundException(`Sale ${saleId} not found`);
        }
        const items = await this.db
            .select()
            .from(sales_schema_1.saleItems)
            .where((0, drizzle_orm_1.eq)(sales_schema_1.saleItems.saleId, saleId));
        return { ...sale, items };
    }
    async getReceipt(businessId, saleId) {
        const [sale] = await this.db
            .select()
            .from(sales_schema_1.sales)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(sales_schema_1.sales.id, saleId), (0, drizzle_orm_1.eq)(sales_schema_1.sales.businessId, businessId)))
            .limit(1);
        if (!sale) {
            throw new common_1.NotFoundException(`Sale ${saleId} not found`);
        }
        const items = await this.db
            .select()
            .from(sales_schema_1.saleItems)
            .where((0, drizzle_orm_1.eq)(sales_schema_1.saleItems.saleId, saleId));
        const payments = await this.db
            .select()
            .from(sales_schema_1.salePayments)
            .where((0, drizzle_orm_1.eq)(sales_schema_1.salePayments.saleId, saleId));
        return {
            sale,
            items,
            payments,
        };
    }
    async resolveItems(businessId, dtos) {
        const resolved = [];
        for (const item of dtos) {
            if (item.barcode) {
                const [prod] = await this.db
                    .select()
                    .from(product_schema_1.products)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(product_schema_1.products.businessId, businessId), (0, drizzle_orm_1.eq)(product_schema_1.products.barcode, item.barcode)))
                    .limit(1);
                if (!prod)
                    throw new common_1.BadRequestException(`Barcode ${item.barcode} not found`);
                let taxRate = 0;
                if (prod.taxId) {
                    const [tax] = await this.db
                        .select()
                        .from(product_schema_1.taxes)
                        .where((0, drizzle_orm_1.eq)(product_schema_1.taxes.id, prod.taxId))
                        .limit(1);
                    if (tax)
                        taxRate = Number(tax.rate);
                }
                resolved.push({
                    ...item,
                    productId: prod.id,
                    unitPrice: item.unitPrice,
                    tax: Math.floor(item.unitPrice * (taxRate / 100)) * item.qty,
                });
            }
            else if (item.productId) {
                let taxRate = 0;
                const [prod] = await this.db
                    .select()
                    .from(product_schema_1.products)
                    .where((0, drizzle_orm_1.eq)(product_schema_1.products.id, item.productId))
                    .limit(1);
                if (prod && prod.taxId) {
                    const [tax] = await this.db
                        .select()
                        .from(product_schema_1.taxes)
                        .where((0, drizzle_orm_1.eq)(product_schema_1.taxes.id, prod.taxId))
                        .limit(1);
                    if (tax)
                        taxRate = Number(tax.rate);
                }
                resolved.push({
                    ...item,
                    productId: item.productId,
                    tax: Math.floor(item.unitPrice * (taxRate / 100)) * item.qty,
                });
            }
            else {
                throw new common_1.BadRequestException('Item must have either barcode or productId');
            }
        }
        return resolved;
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [Function])
], CartService);
//# sourceMappingURL=cart.service.js.map