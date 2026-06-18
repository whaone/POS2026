"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundJobsModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const jobs_dispatcher_service_1 = require("./services/jobs-dispatcher.service");
const mock_processors_1 = require("./processors/mock.processors");
let BackgroundJobsModule = class BackgroundJobsModule {
};
exports.BackgroundJobsModule = BackgroundJobsModule;
exports.BackgroundJobsModule = BackgroundJobsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.registerQueue({ name: 'booking-reminder' }, { name: 'payment-reminder' }, { name: 'stock-alerts' }, { name: 'report-generation' }, { name: 'loyalty-recalc' }),
        ],
        providers: [
            jobs_dispatcher_service_1.JobsDispatcherService,
            mock_processors_1.BookingReminderProcessor,
            mock_processors_1.PaymentReminderProcessor,
            mock_processors_1.StockAlertsProcessor,
            mock_processors_1.LoyaltyRecalcProcessor,
        ],
        exports: [jobs_dispatcher_service_1.JobsDispatcherService],
    })
], BackgroundJobsModule);
//# sourceMappingURL=background-jobs.module.js.map