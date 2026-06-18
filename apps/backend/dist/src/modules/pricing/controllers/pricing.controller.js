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
exports.PricingController = void 0;
const common_1 = require("@nestjs/common");
const pricing_service_1 = require("../services/pricing.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let PricingController = class PricingController {
    pricingService;
    constructor(pricingService) {
        this.pricingService = pricingService;
    }
    async getQuote(productId, customerId, qty) {
        return this.pricingService.getQuote(productId, customerId, qty ? Number(qty) : 1);
    }
    async createDiscount(req, data) {
        return this.pricingService.createDiscount(req.user.businessId, data);
    }
    async findAllDiscounts(req) {
        return this.pricingService.findAllDiscounts(req.user.businessId);
    }
    async createMarkdown(req, data) {
        return this.pricingService.createMarkdown(req.user.businessId, data);
    }
    async findAllMarkdowns(req) {
        return this.pricingService.findAllMarkdowns(req.user.businessId);
    }
};
exports.PricingController = PricingController;
__decorate([
    (0, common_1.Get)('quote'),
    __param(0, (0, common_1.Query)('productId')),
    __param(1, (0, common_1.Query)('customerId')),
    __param(2, (0, common_1.Query)('qty')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "getQuote", null);
__decorate([
    (0, common_1.Post)('discounts'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "createDiscount", null);
__decorate([
    (0, common_1.Get)('discounts'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "findAllDiscounts", null);
__decorate([
    (0, common_1.Post)('markdowns'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "createMarkdown", null);
__decorate([
    (0, common_1.Get)('markdowns'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "findAllMarkdowns", null);
exports.PricingController = PricingController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('pricing'),
    __metadata("design:paramtypes", [pricing_service_1.PricingService])
], PricingController);
//# sourceMappingURL=pricing.controller.js.map