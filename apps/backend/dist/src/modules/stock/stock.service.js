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
exports.StockService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_module_1 = require("../../core/database/database.module");
const stock_schema_1 = require("../../db/schema/stock.schema");
const event_emitter_1 = require("@nestjs/event-emitter");
let StockService = class StockService {
    db;
    eventEmitter;
    constructor(db, eventEmitter) {
        this.db = db;
        this.eventEmitter = eventEmitter;
    }
    async getStock(businessId, locationId) {
        return this.db
            .select()
            .from(stock_schema_1.stock)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(stock_schema_1.stock.businessId, businessId), (0, drizzle_orm_1.eq)(stock_schema_1.stock.locationId, locationId)));
    }
    async getStockByProduct(businessId, productId) {
        return this.db
            .select()
            .from(stock_schema_1.stock)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(stock_schema_1.stock.businessId, businessId), (0, drizzle_orm_1.eq)(stock_schema_1.stock.productId, productId)));
    }
    async deductStock(businessId, locationId, productId, qty, variationId) {
        await this.db.transaction(async (tx) => {
            const whereClause = variationId
                ? (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(stock_schema_1.stock.businessId, businessId), (0, drizzle_orm_1.eq)(stock_schema_1.stock.productId, productId), (0, drizzle_orm_1.eq)(stock_schema_1.stock.variationId, variationId), (0, drizzle_orm_1.eq)(stock_schema_1.stock.locationId, locationId))
                : (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(stock_schema_1.stock.businessId, businessId), (0, drizzle_orm_1.eq)(stock_schema_1.stock.productId, productId), (0, drizzle_orm_1.eq)(stock_schema_1.stock.locationId, locationId));
            const [row] = await tx
                .select()
                .from(stock_schema_1.stock)
                .where(whereClause)
                .for('update')
                .limit(1);
            if (!row) {
                throw new common_1.ConflictException('Insufficient stock');
            }
            const availableQty = row.qty - row.qtyHeld;
            if (availableQty < qty) {
                throw new common_1.ConflictException('Insufficient stock');
            }
            const [updated] = await tx
                .update(stock_schema_1.stock)
                .set({ qty: (0, drizzle_orm_1.sql) `${stock_schema_1.stock.qty} - ${qty}`, updatedAt: new Date() })
                .where(whereClause)
                .returning();
            this.eventEmitter.emit('stock.changed', {
                businessId,
                locationId,
                productId,
                qty: updated.qty,
                qtyHeld: updated.qtyHeld,
            });
        });
    }
    async increaseStock(businessId, locationId, productId, qty, variationId) {
        await this.db.transaction(async (tx) => {
            const whereClause = variationId
                ? (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(stock_schema_1.stock.businessId, businessId), (0, drizzle_orm_1.eq)(stock_schema_1.stock.productId, productId), (0, drizzle_orm_1.eq)(stock_schema_1.stock.variationId, variationId), (0, drizzle_orm_1.eq)(stock_schema_1.stock.locationId, locationId))
                : (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(stock_schema_1.stock.businessId, businessId), (0, drizzle_orm_1.eq)(stock_schema_1.stock.productId, productId), (0, drizzle_orm_1.eq)(stock_schema_1.stock.locationId, locationId));
            const [updated] = await tx
                .update(stock_schema_1.stock)
                .set({ qty: (0, drizzle_orm_1.sql) `${stock_schema_1.stock.qty} + ${qty}`, updatedAt: new Date() })
                .where(whereClause)
                .returning();
            this.eventEmitter.emit('stock.changed', {
                businessId,
                locationId,
                productId,
                qty: updated.qty,
                qtyHeld: updated.qtyHeld,
            });
        });
    }
    async createAdjustment(payload) {
        return this.db.transaction(async (tx) => {
            const [adjustment] = await tx
                .insert(stock_schema_1.stockAdjustments)
                .values({
                businessId: payload.businessId,
                locationId: payload.locationId,
                type: payload.type,
                reason: payload.reason,
                recoveryAmount: payload.recoveryAmount || 0,
                createdBy: payload.createdBy,
            })
                .returning();
            for (const item of payload.items) {
                await tx.insert(stock_schema_1.stockAdjustmentItems).values({
                    adjustmentId: adjustment.id,
                    productId: item.productId,
                    variationId: item.variationId,
                    qty: item.qty,
                });
                const whereClause = item.variationId
                    ? (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(stock_schema_1.stock.businessId, payload.businessId), (0, drizzle_orm_1.eq)(stock_schema_1.stock.locationId, payload.locationId), (0, drizzle_orm_1.eq)(stock_schema_1.stock.productId, item.productId), (0, drizzle_orm_1.eq)(stock_schema_1.stock.variationId, item.variationId))
                    : (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(stock_schema_1.stock.businessId, payload.businessId), (0, drizzle_orm_1.eq)(stock_schema_1.stock.locationId, payload.locationId), (0, drizzle_orm_1.eq)(stock_schema_1.stock.productId, item.productId));
                const [existingStock] = await tx
                    .select()
                    .from(stock_schema_1.stock)
                    .where(whereClause)
                    .for('update')
                    .limit(1);
                if (payload.type === 'increase') {
                    if (existingStock) {
                        await tx
                            .update(stock_schema_1.stock)
                            .set({
                            qty: (0, drizzle_orm_1.sql) `${stock_schema_1.stock.qty} + ${item.qty}`,
                            updatedAt: new Date(),
                        })
                            .where(whereClause);
                    }
                    else {
                        await tx.insert(stock_schema_1.stock).values({
                            businessId: payload.businessId,
                            locationId: payload.locationId,
                            productId: item.productId,
                            variationId: item.variationId,
                            qty: item.qty,
                        });
                    }
                }
                else if (payload.type === 'decrease') {
                    if (!existingStock || existingStock.qty < item.qty) {
                        throw new common_1.ConflictException('Insufficient stock for decrease adjustment');
                    }
                    await tx
                        .update(stock_schema_1.stock)
                        .set({
                        qty: (0, drizzle_orm_1.sql) `${stock_schema_1.stock.qty} - ${item.qty}`,
                        updatedAt: new Date(),
                    })
                        .where(whereClause);
                }
            }
            this.eventEmitter.emit('stock.adjusted', {
                adjustmentId: adjustment.id,
                businessId: payload.businessId,
            });
            return adjustment;
        });
    }
    async findAllAdjustments(businessId, locationId) {
        const whereClause = locationId
            ? (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(stock_schema_1.stockAdjustments.businessId, businessId), (0, drizzle_orm_1.eq)(stock_schema_1.stockAdjustments.locationId, locationId))
            : (0, drizzle_orm_1.eq)(stock_schema_1.stockAdjustments.businessId, businessId);
        return this.db
            .select()
            .from(stock_schema_1.stockAdjustments)
            .where(whereClause)
            .orderBy((0, drizzle_orm_1.sql) `${stock_schema_1.stockAdjustments.createdAt} DESC`);
    }
    async findAdjustment(businessId, id) {
        const [adjustment] = await this.db
            .select()
            .from(stock_schema_1.stockAdjustments)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(stock_schema_1.stockAdjustments.id, id), (0, drizzle_orm_1.eq)(stock_schema_1.stockAdjustments.businessId, businessId)));
        if (!adjustment) {
            throw new common_1.NotFoundException('Adjustment not found');
        }
        const items = await this.db
            .select()
            .from(stock_schema_1.stockAdjustmentItems)
            .where((0, drizzle_orm_1.eq)(stock_schema_1.stockAdjustmentItems.adjustmentId, id));
        return { ...adjustment, items };
    }
    async transferStock(payload) {
        return this.db.transaction(async (tx) => {
            const [transfer] = await tx
                .insert(stock_schema_1.stockTransfers)
                .values({
                businessId: payload.businessId,
                fromLocationId: payload.fromLocationId,
                toLocationId: payload.toLocationId,
                status: 'in_transit',
            })
                .returning();
            for (const item of payload.items) {
                const [sourceStock] = await tx
                    .select()
                    .from(stock_schema_1.stock)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(stock_schema_1.stock.businessId, payload.businessId), (0, drizzle_orm_1.eq)(stock_schema_1.stock.locationId, payload.fromLocationId), (0, drizzle_orm_1.eq)(stock_schema_1.stock.productId, item.productId)))
                    .for('update')
                    .limit(1);
                if (!sourceStock || sourceStock.qty < item.qty) {
                    throw new common_1.ConflictException('Insufficient stock for transfer');
                }
                await tx
                    .update(stock_schema_1.stock)
                    .set({
                    qty: (0, drizzle_orm_1.sql) `${stock_schema_1.stock.qty} - ${item.qty}`,
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(stock_schema_1.stock.id, sourceStock.id));
                await tx.insert(stock_schema_1.stockTransferItems).values({
                    transferId: transfer.id,
                    productId: item.productId,
                    qty: item.qty,
                });
            }
            this.eventEmitter.emit('stock.transfer.created', {
                transferId: transfer.id,
                businessId: payload.businessId,
                fromLocationId: payload.fromLocationId,
                toLocationId: payload.toLocationId,
            });
            return transfer;
        });
    }
    async completeTransfer(transferId) {
        return this.db.transaction(async (tx) => {
            const [transfer] = await tx
                .select()
                .from(stock_schema_1.stockTransfers)
                .where((0, drizzle_orm_1.eq)(stock_schema_1.stockTransfers.id, transferId));
            if (!transfer || transfer.status !== 'in_transit') {
                throw new common_1.NotFoundException('Transfer not found or not in transit');
            }
            const items = await tx
                .select()
                .from(stock_schema_1.stockTransferItems)
                .where((0, drizzle_orm_1.eq)(stock_schema_1.stockTransferItems.transferId, transferId));
            for (const item of items) {
                if (!item.productId)
                    continue;
                const [destStock] = await tx
                    .select()
                    .from(stock_schema_1.stock)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(stock_schema_1.stock.businessId, transfer.businessId), (0, drizzle_orm_1.eq)(stock_schema_1.stock.locationId, transfer.toLocationId), (0, drizzle_orm_1.eq)(stock_schema_1.stock.productId, item.productId)))
                    .for('update')
                    .limit(1);
                if (destStock) {
                    await tx
                        .update(stock_schema_1.stock)
                        .set({
                        qty: (0, drizzle_orm_1.sql) `${stock_schema_1.stock.qty} + ${item.qty}`,
                        updatedAt: new Date(),
                    })
                        .where((0, drizzle_orm_1.eq)(stock_schema_1.stock.id, destStock.id));
                }
                else {
                    await tx.insert(stock_schema_1.stock).values({
                        businessId: transfer.businessId,
                        locationId: transfer.toLocationId,
                        productId: item.productId,
                        qty: item.qty,
                    });
                }
            }
            await tx
                .update(stock_schema_1.stockTransfers)
                .set({ status: 'completed', receivedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(stock_schema_1.stockTransfers.id, transferId));
            this.eventEmitter.emit('stock.transfer.completed', {
                transferId,
                businessId: transfer.businessId,
            });
            return { success: true };
        });
    }
};
exports.StockService = StockService;
exports.StockService = StockService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [Function, event_emitter_1.EventEmitter2])
], StockService);
//# sourceMappingURL=stock.service.js.map