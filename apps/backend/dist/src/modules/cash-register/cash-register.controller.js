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
exports.CashRegisterController = void 0;
const common_1 = require("@nestjs/common");
const cash_register_service_1 = require("./cash-register.service");
const open_register_dto_1 = require("./dto/open-register.dto");
const cash_movement_dto_1 = require("./dto/cash-movement.dto");
const close_register_dto_1 = require("./dto/close-register.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let CashRegisterController = class CashRegisterController {
    cashRegisterService;
    constructor(cashRegisterService) {
        this.cashRegisterService = cashRegisterService;
    }
    openRegister(user, dto) {
        return this.cashRegisterService.openRegister(user.businessId, user.sub, dto);
    }
    getCurrent(user) {
        return this.cashRegisterService.getCurrent(user.businessId, user.sub);
    }
    cashIn(user, dto) {
        return this.cashRegisterService.cashIn(user.businessId, user.sub, dto);
    }
    cashOut(user, dto) {
        return this.cashRegisterService.cashOut(user.businessId, user.sub, dto);
    }
    closeRegister(user, dto) {
        return this.cashRegisterService.closeRegister(user.businessId, user.sub, dto);
    }
};
exports.CashRegisterController = CashRegisterController;
__decorate([
    (0, common_1.Post)('open'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, open_register_dto_1.OpenRegisterDto]),
    __metadata("design:returntype", void 0)
], CashRegisterController.prototype, "openRegister", null);
__decorate([
    (0, common_1.Get)('current'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CashRegisterController.prototype, "getCurrent", null);
__decorate([
    (0, common_1.Post)('cash-in'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, cash_movement_dto_1.CashMovementDto]),
    __metadata("design:returntype", void 0)
], CashRegisterController.prototype, "cashIn", null);
__decorate([
    (0, common_1.Post)('cash-out'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, cash_movement_dto_1.CashMovementDto]),
    __metadata("design:returntype", void 0)
], CashRegisterController.prototype, "cashOut", null);
__decorate([
    (0, common_1.Post)('close'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, close_register_dto_1.CloseRegisterDto]),
    __metadata("design:returntype", void 0)
], CashRegisterController.prototype, "closeRegister", null);
exports.CashRegisterController = CashRegisterController = __decorate([
    (0, common_1.Controller)('register'),
    __metadata("design:paramtypes", [cash_register_service_1.CashRegisterService])
], CashRegisterController);
//# sourceMappingURL=cash-register.controller.js.map