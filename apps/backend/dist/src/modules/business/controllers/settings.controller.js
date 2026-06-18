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
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const settings_service_1 = require("../services/settings.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const settings_dto_1 = require("../dto/settings.dto");
let SettingsController = class SettingsController {
    settingsService;
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    findAllTemplates(req) {
        return this.settingsService.findAllInvoiceTemplates(req.user.businessId);
    }
    createTemplate(req, dto) {
        return this.settingsService.createInvoiceTemplate(req.user.businessId, dto);
    }
    updateTemplate(req, id, dto) {
        return this.settingsService.updateInvoiceTemplate(req.user.businessId, id, dto);
    }
    deleteTemplate(req, id) {
        return this.settingsService.deleteInvoiceTemplate(req.user.businessId, id);
    }
    getBarcodeSetting(req) {
        return this.settingsService.getBarcodeSetting(req.user.businessId);
    }
    updateBarcodeSetting(req, dto) {
        return this.settingsService.upsertBarcodeSetting(req.user.businessId, dto);
    }
    findAllDevices(req) {
        return this.settingsService.findAllDevices(req.user.businessId);
    }
    createDevice(req, dto) {
        return this.settingsService.createDevice(req.user.businessId, dto);
    }
    updateDevice(req, id, dto) {
        return this.settingsService.updateDevice(req.user.businessId, id, dto);
    }
    deleteDevice(req, id) {
        return this.settingsService.deleteDevice(req.user.businessId, id);
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Get)('invoice-templates'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "findAllTemplates", null);
__decorate([
    (0, common_1.Post)('invoice-templates'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, settings_dto_1.CreateInvoiceTemplateDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "createTemplate", null);
__decorate([
    (0, common_1.Patch)('invoice-templates/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, settings_dto_1.UpdateInvoiceTemplateDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "updateTemplate", null);
__decorate([
    (0, common_1.Delete)('invoice-templates/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "deleteTemplate", null);
__decorate([
    (0, common_1.Get)('barcode'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getBarcodeSetting", null);
__decorate([
    (0, common_1.Patch)('barcode'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, settings_dto_1.CreateBarcodeSettingDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "updateBarcodeSetting", null);
__decorate([
    (0, common_1.Get)('devices'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "findAllDevices", null);
__decorate([
    (0, common_1.Post)('devices'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, settings_dto_1.CreateDeviceDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "createDevice", null);
__decorate([
    (0, common_1.Patch)('devices/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, settings_dto_1.UpdateDeviceDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "updateDevice", null);
__decorate([
    (0, common_1.Delete)('devices/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "deleteDevice", null);
exports.SettingsController = SettingsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('settings'),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map