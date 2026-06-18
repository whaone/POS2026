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
exports.CheckoutService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const event_emitter_1 = require("@nestjs/event-emitter");
const database_module_1 = require("../../../core/database/database.module");
const sales_schema_1 = require("../../../db/schema/sales.schema");
const checkout_dto_1 = require("../dto/checkout.dto");
const voucher_service_1 = require("../../pricing/services/voucher.service");
let CheckoutService = class CheckoutService {
    db;
    eventEmitter;
    voucherService;
    constructor(db, eventEmitter, voucherService) {
        this.db = db;
        this.eventEmitter = eventEmitter;
        this.voucherService = voucherService;
    }
    async processPayment(businessId, dto) {
        const [existingByKey] = await this.db
            .select()
            .from(sales_schema_1.sales)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(sales_schema_1.sales.idempotencyKey, dto.idempotencyKey), (0, drizzle_orm_1.eq)(sales_schema_1.sales.businessId, businessId)))
            .limit(1);
        if (existingByKey && existingByKey.status === 'paid') {
            return existingByKey;
        }
        return this.db.transaction(async (tx) => {
            const [sale] = await tx
                .select()
                .from(sales_schema_1.sales)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(sales_schema_1.sales.id, dto.saleId), (0, drizzle_orm_1.eq)(sales_schema_1.sales.businessId, businessId)))
                .for('update')
                .limit(1);
            if (!sale) {
                throw new common_1.NotFoundException(`Sale ${dto.saleId} not found`);
            }
            if (sale.status === 'paid') {
                throw new common_1.UnprocessableEntityException('Sale is already paid');
            }
            const totalPayment = dto.payments.reduce((sum, p) => sum + p.amount, 0);
            if (totalPayment < sale.grandTotal) {
                throw new common_1.UnprocessableEntityException({
                    message: 'Payment amount is less than grand total',
                    code: 'E-PAY-422',
                });
            }
            for (const payment of dto.payments) {
                if (payment.method === checkout_dto_1.PaymentMethod.VOUCHER) {
                    if (!payment.voucherCode) {
                        throw new common_1.BadRequestException('voucherCode is required for voucher payment');
                    }
                    const voucher = await this.voucherService.validateVoucher(payment.voucherCode, sale.grandTotal);
                    await this.voucherService.redeemVoucherInTx(tx, voucher.id, {
                        transactionId: sale.id,
                        branchId: sale.locationId,
                        cashierId: sale.cashierId || '',
                        amountUsed: payment.amount,
                    });
                }
            }
            const paymentInserts = dto.payments.map((p) => ({
                saleId: sale.id,
                method: p.method,
                amount: p.amount,
                accountId: p.accountId,
                ref: p.ref,
            }));
            await tx.insert(sales_schema_1.salePayments).values(paymentInserts);
            const [updatedSale] = await tx
                .update(sales_schema_1.sales)
                .set({
                paidTotal: totalPayment,
                status: 'paid',
                idempotencyKey: dto.idempotencyKey,
            })
                .where((0, drizzle_orm_1.eq)(sales_schema_1.sales.id, sale.id))
                .returning();
            this.eventEmitter.emit('TransactionCompleted', {
                saleId: updatedSale.id,
                businessId: updatedSale.businessId,
                locationId: updatedSale.locationId,
                customerId: updatedSale.customerId,
                cashierId: updatedSale.cashierId,
                grandTotal: updatedSale.grandTotal,
                paidTotal: updatedSale.paidTotal,
            });
            return updatedSale;
        });
    }
};
exports.CheckoutService = CheckoutService;
exports.CheckoutService = CheckoutService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [Function, event_emitter_1.EventEmitter2,
        voucher_service_1.VoucherService])
], CheckoutService);
//# sourceMappingURL=checkout.service.js.map