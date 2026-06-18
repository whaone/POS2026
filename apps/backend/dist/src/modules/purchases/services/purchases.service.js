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
exports.PurchasesService = void 0;
const common_1 = require("@nestjs/common");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const drizzle_orm_1 = require("drizzle-orm");
const event_emitter_1 = require("@nestjs/event-emitter");
const purchase_schema_1 = require("../../../db/schema/purchase.schema");
const stock_schema_1 = require("../../../db/schema/stock.schema");
const contact_schema_1 = require("../../../db/schema/contact.schema");
let PurchasesService = class PurchasesService {
    db;
    eventEmitter;
    constructor(db, eventEmitter) {
        this.db = db;
        this.eventEmitter = eventEmitter;
    }
    async create(businessId, dto) {
        const [purchase] = await this.db
            .insert(purchase_schema_1.purchases)
            .values({
            businessId,
            locationId: dto.locationId,
            supplierId: dto.supplierId,
            subtotal: dto.subtotal,
            taxTotal: dto.taxTotal,
            discount: dto.discount,
            shipping: dto.shipping,
            grandTotal: dto.grandTotal,
            status: 'credit',
        })
            .returning();
        if (dto.items && dto.items.length > 0) {
            await this.db.insert(purchase_schema_1.purchaseItems).values(dto.items.map((item) => ({
                purchaseId: purchase.id,
                productId: item.productId,
                variationId: item.variationId,
                qty: item.qty,
                cost: item.cost,
                tax: item.tax,
                lotNumber: item.lotNumber,
                expiryDate: item.expiryDate,
            })));
        }
        return purchase;
    }
    async update(businessId, purchaseId, dto) {
        const [purchase] = await this.db
            .select()
            .from(purchase_schema_1.purchases)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(purchase_schema_1.purchases.id, purchaseId), (0, drizzle_orm_1.eq)(purchase_schema_1.purchases.businessId, businessId)));
        if (!purchase) {
            throw new common_1.NotFoundException('Purchase not found');
        }
        if (purchase.status !== 'credit') {
            throw new common_1.BadRequestException('Cannot update purchase that is not in credit status');
        }
        const [updated] = await this.db
            .update(purchase_schema_1.purchases)
            .set({ ...dto, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(purchase_schema_1.purchases.id, purchaseId))
            .returning();
        if (dto.items) {
            await this.db
                .delete(purchase_schema_1.purchaseItems)
                .where((0, drizzle_orm_1.eq)(purchase_schema_1.purchaseItems.purchaseId, purchaseId));
            if (dto.items.length > 0) {
                await this.db.insert(purchase_schema_1.purchaseItems).values(dto.items.map((item) => ({
                    purchaseId,
                    productId: item.productId,
                    variationId: item.variationId,
                    qty: item.qty,
                    cost: item.cost,
                    tax: item.tax,
                    lotNumber: item.lotNumber,
                    expiryDate: item.expiryDate,
                })));
            }
        }
        return updated;
    }
    async remove(businessId, purchaseId) {
        const [purchase] = await this.db
            .select()
            .from(purchase_schema_1.purchases)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(purchase_schema_1.purchases.id, purchaseId), (0, drizzle_orm_1.eq)(purchase_schema_1.purchases.businessId, businessId)));
        if (!purchase) {
            throw new common_1.NotFoundException('Purchase not found');
        }
        if (purchase.status !== 'credit') {
            throw new common_1.BadRequestException('Cannot delete purchase that is not in credit status');
        }
        await this.db.delete(purchase_schema_1.purchases).where((0, drizzle_orm_1.eq)(purchase_schema_1.purchases.id, purchaseId));
        return { success: true };
    }
    async findAll(businessId) {
        return this.db
            .select()
            .from(purchase_schema_1.purchases)
            .where((0, drizzle_orm_1.eq)(purchase_schema_1.purchases.businessId, businessId));
    }
    async findOne(businessId, id) {
        const [purchase] = await this.db
            .select()
            .from(purchase_schema_1.purchases)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(purchase_schema_1.purchases.id, id), (0, drizzle_orm_1.eq)(purchase_schema_1.purchases.businessId, businessId)));
        if (!purchase) {
            throw new common_1.NotFoundException('Purchase not found');
        }
        const items = await this.db
            .select()
            .from(purchase_schema_1.purchaseItems)
            .where((0, drizzle_orm_1.eq)(purchase_schema_1.purchaseItems.purchaseId, id));
        return { ...purchase, items };
    }
    async receivePurchase(businessId, purchaseId) {
        const [purchase] = await this.db
            .select()
            .from(purchase_schema_1.purchases)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(purchase_schema_1.purchases.id, purchaseId), (0, drizzle_orm_1.eq)(purchase_schema_1.purchases.businessId, businessId)));
        if (!purchase) {
            throw new common_1.NotFoundException(`Purchase not found`);
        }
        if (purchase.status === 'received' || purchase.status === 'paid') {
            throw new common_1.BadRequestException(`Purchase already processed`);
        }
        const items = await this.db
            .select()
            .from(purchase_schema_1.purchaseItems)
            .where((0, drizzle_orm_1.eq)(purchase_schema_1.purchaseItems.purchaseId, purchaseId));
        await this.db.transaction(async (tx) => {
            await tx
                .update(purchase_schema_1.purchases)
                .set({ status: 'received', updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(purchase_schema_1.purchases.id, purchaseId));
            await tx.insert(contact_schema_1.contactLedgers).values({
                contactId: purchase.supplierId,
                refType: 'purchase',
                refId: purchaseId,
                credit: purchase.grandTotal,
                debit: 0,
                balance: purchase.grandTotal,
            });
            for (const item of items) {
                const [existingStock] = await tx
                    .select()
                    .from(stock_schema_1.stock)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(stock_schema_1.stock.businessId, businessId), (0, drizzle_orm_1.eq)(stock_schema_1.stock.locationId, purchase.locationId), (0, drizzle_orm_1.eq)(stock_schema_1.stock.productId, item.productId), item.variationId
                    ? (0, drizzle_orm_1.eq)(stock_schema_1.stock.variationId, item.variationId)
                    : undefined));
                if (existingStock) {
                    await tx
                        .update(stock_schema_1.stock)
                        .set({
                        qty: existingStock.qty + item.qty,
                        updatedAt: new Date(),
                    })
                        .where((0, drizzle_orm_1.eq)(stock_schema_1.stock.id, existingStock.id));
                }
                else {
                    await tx.insert(stock_schema_1.stock).values({
                        businessId,
                        locationId: purchase.locationId,
                        productId: item.productId,
                        variationId: item.variationId,
                        qty: item.qty,
                    });
                }
            }
        });
        this.eventEmitter.emit('purchase.received', {
            purchaseId,
            businessId,
            grandTotal: purchase.grandTotal,
        });
        return { success: true };
    }
    async createPayment(purchaseId, dto) {
        return this.db.transaction(async (tx) => {
            const [purchase] = await tx
                .select()
                .from(purchase_schema_1.purchases)
                .where((0, drizzle_orm_1.eq)(purchase_schema_1.purchases.id, purchaseId))
                .for('update');
            if (!purchase) {
                throw new common_1.NotFoundException('Purchase not found');
            }
            const [payment] = await tx
                .insert(purchase_schema_1.purchasePayments)
                .values({
                purchaseId,
                method: dto.method,
                amount: dto.amount,
                accountId: dto.accountId,
            })
                .returning();
            const newPaidTotal = purchase.paidTotal + dto.amount;
            await tx
                .update(purchase_schema_1.purchases)
                .set({
                paidTotal: newPaidTotal,
                status: newPaidTotal >= purchase.grandTotal ? 'paid' : 'partial',
            })
                .where((0, drizzle_orm_1.eq)(purchase_schema_1.purchases.id, purchaseId));
            await tx.insert(contact_schema_1.contactLedgers).values({
                contactId: purchase.supplierId,
                refType: 'payment',
                refId: payment.id,
                debit: dto.amount,
                credit: 0,
                balance: 0,
            });
            this.eventEmitter.emit('payment.recorded', {
                type: 'purchase',
                paymentId: payment.id,
                amount: dto.amount,
                accountId: dto.accountId,
            });
            return payment;
        });
    }
    async createReturn(businessId, purchaseId, dto) {
        return this.db.transaction(async (tx) => {
            const [purchase] = await tx
                .select()
                .from(purchase_schema_1.purchases)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(purchase_schema_1.purchases.id, purchaseId), (0, drizzle_orm_1.eq)(purchase_schema_1.purchases.businessId, businessId)));
            if (!purchase) {
                throw new common_1.NotFoundException('Purchase not found');
            }
            const [returnRecord] = await tx
                .insert(purchase_schema_1.purchaseReturns)
                .values({
                purchaseId,
                businessId,
                reason: dto.reason,
                amount: dto.amount,
            })
                .returning();
            if (dto.items && dto.items.length > 0) {
                await tx.insert(purchase_schema_1.purchaseReturnItems).values(dto.items.map((item) => ({
                    returnId: returnRecord.id,
                    purchaseItemId: item.purchaseItemId,
                    qty: item.qty,
                })));
                for (const item of dto.items) {
                    const [existingStock] = await tx
                        .select()
                        .from(stock_schema_1.stock)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(stock_schema_1.stock.businessId, businessId), (0, drizzle_orm_1.eq)(stock_schema_1.stock.locationId, purchase.locationId), (0, drizzle_orm_1.eq)(stock_schema_1.stock.productId, item.productId)))
                        .for('update')
                        .limit(1);
                    if (existingStock && existingStock.qty >= item.qty) {
                        await tx
                            .update(stock_schema_1.stock)
                            .set({
                            qty: existingStock.qty - item.qty,
                            updatedAt: new Date(),
                        })
                            .where((0, drizzle_orm_1.eq)(stock_schema_1.stock.id, existingStock.id));
                    }
                }
            }
            if (purchase.status === 'received' ||
                purchase.status === 'paid' ||
                purchase.status === 'partial') {
                await tx.insert(contact_schema_1.contactLedgers).values({
                    contactId: purchase.supplierId,
                    refType: 'purchase',
                    refId: purchaseId,
                    debit: dto.amount,
                    credit: 0,
                    balance: 0,
                });
            }
            return returnRecord;
        });
    }
};
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DB_CLIENT')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase,
        event_emitter_1.EventEmitter2])
], PurchasesService);
//# sourceMappingURL=purchases.service.js.map