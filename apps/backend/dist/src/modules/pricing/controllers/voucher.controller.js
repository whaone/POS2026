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
exports.VoucherController = void 0;
const common_1 = require("@nestjs/common");
const voucher_service_1 = require("../services/voucher.service");
const voucher_dto_1 = require("../dto/voucher.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let VoucherController = class VoucherController {
    voucherService;
    constructor(voucherService) {
        this.voucherService = voucherService;
    }
    async validate(validateDto) {
        return this.voucherService.validateVoucher(validateDto.code, validateDto.purchaseAmount);
    }
    async redeem(redeemDto) {
        return this.voucherService.redeemVoucher(redeemDto);
    }
};
exports.VoucherController = VoucherController;
__decorate([
    (0, common_1.Post)('validate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [voucher_dto_1.ValidateVoucherDto]),
    __metadata("design:returntype", Promise)
], VoucherController.prototype, "validate", null);
__decorate([
    (0, common_1.Post)('redeem'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [voucher_dto_1.RedeemVoucherDto]),
    __metadata("design:returntype", Promise)
], VoucherController.prototype, "redeem", null);
exports.VoucherController = VoucherController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('vouchers'),
    __metadata("design:paramtypes", [voucher_service_1.VoucherService])
], VoucherController);
//# sourceMappingURL=voucher.controller.js.map