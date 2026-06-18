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
exports.PayrollsController = void 0;
const common_1 = require("@nestjs/common");
const payrolls_service_1 = require("./payrolls.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const payroll_dto_1 = require("./dto/payroll.dto");
let PayrollsController = class PayrollsController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll(req) {
        return this.service.findAll(req.user.businessId);
    }
    findOne(req, id) {
        return this.service.findOne(req.user.businessId, id);
    }
    create(req, dto) {
        return this.service.create(req.user.businessId, dto);
    }
    update(req, id, dto) {
        return this.service.update(req.user.businessId, id, dto);
    }
    remove(req, id) {
        return this.service.remove(req.user.businessId, id);
    }
};
exports.PayrollsController = PayrollsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PayrollsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PayrollsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payroll_dto_1.CreatePayrollDto]),
    __metadata("design:returntype", void 0)
], PayrollsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, payroll_dto_1.UpdatePayrollDto]),
    __metadata("design:returntype", void 0)
], PayrollsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PayrollsController.prototype, "remove", null);
exports.PayrollsController = PayrollsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('payroll'),
    __metadata("design:paramtypes", [payrolls_service_1.PayrollsService])
], PayrollsController);
//# sourceMappingURL=payrolls.controller.js.map