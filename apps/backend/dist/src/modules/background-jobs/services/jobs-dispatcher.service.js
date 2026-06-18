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
var JobsDispatcherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsDispatcherService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
let JobsDispatcherService = JobsDispatcherService_1 = class JobsDispatcherService {
    bookingQueue;
    paymentQueue;
    stockQueue;
    reportQueue;
    loyaltyQueue;
    logger = new common_1.Logger(JobsDispatcherService_1.name);
    constructor(bookingQueue, paymentQueue, stockQueue, reportQueue, loyaltyQueue) {
        this.bookingQueue = bookingQueue;
        this.paymentQueue = paymentQueue;
        this.stockQueue = stockQueue;
        this.reportQueue = reportQueue;
        this.loyaltyQueue = loyaltyQueue;
    }
    async handleBookingCreated(payload) {
        const reminderTime = new Date(payload.startTime);
        reminderTime.setHours(reminderTime.getHours() - 24);
        const delay = reminderTime.getTime() - Date.now();
        if (delay > 0) {
            await this.bookingQueue.add('send-reminder', payload, { delay });
            this.logger.log(`Scheduled booking reminder for ${payload.bookingId}`);
        }
    }
    async handlePurchaseReceived(payload) {
        await this.paymentQueue.add('check-payment-due', payload, {
            delay: 7 * 24 * 60 * 60 * 1000,
        });
    }
    async handleStockChanged(payload) {
        await this.stockQueue.add('check-low-stock', payload);
    }
    async handleTransactionCompleted(payload) {
        if (payload.customerId) {
            await this.loyaltyQueue.add('recalc-points', {
                customerId: payload.customerId,
                businessId: payload.businessId,
            });
        }
    }
};
exports.JobsDispatcherService = JobsDispatcherService;
__decorate([
    (0, event_emitter_1.OnEvent)('booking.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JobsDispatcherService.prototype, "handleBookingCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('purchase.received'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JobsDispatcherService.prototype, "handlePurchaseReceived", null);
__decorate([
    (0, event_emitter_1.OnEvent)('stock.changed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JobsDispatcherService.prototype, "handleStockChanged", null);
__decorate([
    (0, event_emitter_1.OnEvent)('transaction.completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JobsDispatcherService.prototype, "handleTransactionCompleted", null);
exports.JobsDispatcherService = JobsDispatcherService = JobsDispatcherService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)('booking-reminder')),
    __param(1, (0, bullmq_1.InjectQueue)('payment-reminder')),
    __param(2, (0, bullmq_1.InjectQueue)('stock-alerts')),
    __param(3, (0, bullmq_1.InjectQueue)('report-generation')),
    __param(4, (0, bullmq_1.InjectQueue)('loyalty-recalc')),
    __metadata("design:paramtypes", [bullmq_2.Queue,
        bullmq_2.Queue,
        bullmq_2.Queue,
        bullmq_2.Queue,
        bullmq_2.Queue])
], JobsDispatcherService);
//# sourceMappingURL=jobs-dispatcher.service.js.map