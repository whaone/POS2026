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
exports.LoyaltyService = void 0;
const common_1 = require("@nestjs/common");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const drizzle_orm_1 = require("drizzle-orm");
const event_emitter_1 = require("@nestjs/event-emitter");
const customer_schema_1 = require("../../../db/schema/customer.schema");
let LoyaltyService = class LoyaltyService {
    db;
    POINTS_CONVERSION_RATE = 10000;
    constructor(db) {
        this.db = db;
    }
    async getBalance(customerId) {
        const [account] = await this.db
            .select()
            .from(customer_schema_1.loyaltyAccounts)
            .where((0, drizzle_orm_1.eq)(customer_schema_1.loyaltyAccounts.customerId, customerId));
        if (!account) {
            return 0;
        }
        return account.pointsBalance;
    }
    async handleTransactionCompleted(payload) {
        if (!payload.customerId)
            return;
        const pointsToEarn = Math.floor(payload.grandTotal / this.POINTS_CONVERSION_RATE);
        if (pointsToEarn <= 0)
            return;
        await this.db.transaction(async (tx) => {
            const [account] = await tx
                .select()
                .from(customer_schema_1.loyaltyAccounts)
                .where((0, drizzle_orm_1.eq)(customer_schema_1.loyaltyAccounts.customerId, payload.customerId));
            if (!account) {
                await tx.insert(customer_schema_1.loyaltyAccounts).values({
                    customerId: payload.customerId,
                    pointsBalance: pointsToEarn,
                });
            }
            else {
                await tx
                    .update(customer_schema_1.loyaltyAccounts)
                    .set({
                    pointsBalance: account.pointsBalance + pointsToEarn,
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(customer_schema_1.loyaltyAccounts.id, account.id));
            }
            await tx.insert(customer_schema_1.loyaltyTransactions).values({
                customerId: payload.customerId,
                type: 'earn',
                points: pointsToEarn,
                saleId: payload.saleId,
            });
        });
    }
    async redeemPoints(customerId, pointsToRedeem, saleId) {
        if (pointsToRedeem <= 0)
            return;
        await this.db.transaction(async (tx) => {
            const [account] = await tx
                .select()
                .from(customer_schema_1.loyaltyAccounts)
                .where((0, drizzle_orm_1.eq)(customer_schema_1.loyaltyAccounts.customerId, customerId));
            if (!account || account.pointsBalance < pointsToRedeem) {
                throw new Error('Insufficient points balance');
            }
            await tx
                .update(customer_schema_1.loyaltyAccounts)
                .set({
                pointsBalance: account.pointsBalance - pointsToRedeem,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(customer_schema_1.loyaltyAccounts.id, account.id));
            await tx.insert(customer_schema_1.loyaltyTransactions).values({
                customerId,
                type: 'redeem',
                points: pointsToRedeem,
                saleId,
            });
        });
    }
};
exports.LoyaltyService = LoyaltyService;
__decorate([
    (0, event_emitter_1.OnEvent)('sales.completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoyaltyService.prototype, "handleTransactionCompleted", null);
exports.LoyaltyService = LoyaltyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DB_CLIENT')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], LoyaltyService);
//# sourceMappingURL=loyalty.service.js.map