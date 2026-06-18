"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BookingReminderProcessor_1, PaymentReminderProcessor_1, StockAlertsProcessor_1, LoyaltyRecalcProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoyaltyRecalcProcessor = exports.StockAlertsProcessor = exports.PaymentReminderProcessor = exports.BookingReminderProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
let BookingReminderProcessor = BookingReminderProcessor_1 = class BookingReminderProcessor extends bullmq_1.WorkerHost {
    logger = new common_1.Logger(BookingReminderProcessor_1.name);
    process(job) {
        this.logger.log(`Processing booking reminder for job ${job.id}`);
        const { bookingId, businessId } = job.data;
        this.logger.log(`[MOCK] Sent reminder for booking ${bookingId} (Business: ${businessId})`);
        return Promise.resolve({ sent: true });
    }
};
exports.BookingReminderProcessor = BookingReminderProcessor;
exports.BookingReminderProcessor = BookingReminderProcessor = BookingReminderProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('booking-reminder')
], BookingReminderProcessor);
let PaymentReminderProcessor = PaymentReminderProcessor_1 = class PaymentReminderProcessor extends bullmq_1.WorkerHost {
    logger = new common_1.Logger(PaymentReminderProcessor_1.name);
    process(job) {
        this.logger.log(`Processing payment reminder for job ${job.id}`);
        this.logger.log(`[MOCK] Checked payment for purchase ${job.data.purchaseId}`);
        return Promise.resolve({ checked: true });
    }
};
exports.PaymentReminderProcessor = PaymentReminderProcessor;
exports.PaymentReminderProcessor = PaymentReminderProcessor = PaymentReminderProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('payment-reminder')
], PaymentReminderProcessor);
let StockAlertsProcessor = StockAlertsProcessor_1 = class StockAlertsProcessor extends bullmq_1.WorkerHost {
    logger = new common_1.Logger(StockAlertsProcessor_1.name);
    process(job) {
        this.logger.log(`Processing stock alert for job ${job.id}`);
        const { productId, qty } = job.data;
        if (qty <= 5) {
            this.logger.log(`[MOCK] Low stock alert sent for product ${productId}. Qty: ${qty}`);
        }
        return Promise.resolve({ processed: true });
    }
};
exports.StockAlertsProcessor = StockAlertsProcessor;
exports.StockAlertsProcessor = StockAlertsProcessor = StockAlertsProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('stock-alerts')
], StockAlertsProcessor);
let LoyaltyRecalcProcessor = LoyaltyRecalcProcessor_1 = class LoyaltyRecalcProcessor extends bullmq_1.WorkerHost {
    logger = new common_1.Logger(LoyaltyRecalcProcessor_1.name);
    process(job) {
        this.logger.log(`Processing loyalty recalc for job ${job.id}`);
        this.logger.log(`[MOCK] Recalculated loyalty points for customer ${job.data.customerId}`);
        return Promise.resolve({ updated: true });
    }
};
exports.LoyaltyRecalcProcessor = LoyaltyRecalcProcessor;
exports.LoyaltyRecalcProcessor = LoyaltyRecalcProcessor = LoyaltyRecalcProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('loyalty-recalc')
], LoyaltyRecalcProcessor);
//# sourceMappingURL=mock.processors.js.map