"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingModule = void 0;
const common_1 = require("@nestjs/common");
const voucher_service_1 = require("./services/voucher.service");
const pricing_service_1 = require("./services/pricing.service");
const voucher_controller_1 = require("./controllers/voucher.controller");
const pricing_controller_1 = require("./controllers/pricing.controller");
let PricingModule = class PricingModule {
};
exports.PricingModule = PricingModule;
exports.PricingModule = PricingModule = __decorate([
    (0, common_1.Module)({
        controllers: [voucher_controller_1.VoucherController, pricing_controller_1.PricingController],
        providers: [voucher_service_1.VoucherService, pricing_service_1.PricingService],
        exports: [voucher_service_1.VoucherService, pricing_service_1.PricingService],
    })
], PricingModule);
//# sourceMappingURL=pricing.module.js.map