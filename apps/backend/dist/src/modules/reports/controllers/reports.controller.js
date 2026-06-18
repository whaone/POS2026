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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("../services/reports.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let ReportsController = class ReportsController {
    reportsService;
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    getProfitLoss(req, startDate, endDate) {
        return this.reportsService.getProfitLoss(req.user.businessId, startDate, endDate);
    }
    getPurchaseSell(req, startDate, endDate) {
        return this.reportsService.getPurchaseSellReport(req.user.businessId, startDate, endDate);
    }
    getStock(req) {
        return this.reportsService.getStockReport(req.user.businessId);
    }
    getTax(req) {
        return this.reportsService.getTaxReport(req.user.businessId);
    }
    getExpense(req) {
        return this.reportsService.getExpenseReport(req.user.businessId);
    }
    getContacts(req) {
        return this.reportsService.getContactsReport(req.user.businessId);
    }
    getCashRegister(req) {
        return this.reportsService.getCashRegisterReport(req.user.businessId);
    }
    getSalesperson(req) {
        return this.reportsService.getSalespersonReport(req.user.businessId);
    }
    getProductPerformance(req) {
        return this.reportsService.getProductPerformance(req.user.businessId);
    }
    getVoucherReport(req) {
        return this.reportsService.getVoucherReport(req.user.businessId);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('profit-loss'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getProfitLoss", null);
__decorate([
    (0, common_1.Get)('purchase-sell'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getPurchaseSell", null);
__decorate([
    (0, common_1.Get)('stock'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getStock", null);
__decorate([
    (0, common_1.Get)('tax'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getTax", null);
__decorate([
    (0, common_1.Get)('expense'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getExpense", null);
__decorate([
    (0, common_1.Get)('contacts'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getContacts", null);
__decorate([
    (0, common_1.Get)('cash-register'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getCashRegister", null);
__decorate([
    (0, common_1.Get)('salesperson'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getSalesperson", null);
__decorate([
    (0, common_1.Get)('product-performance'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getProductPerformance", null);
__decorate([
    (0, common_1.Get)('vouchers'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getVoucherReport", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map