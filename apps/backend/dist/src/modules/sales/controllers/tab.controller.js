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
exports.TabController = void 0;
const common_1 = require("@nestjs/common");
const tab_service_1 = require("../services/tab.service");
const update_tab_dto_1 = require("../dto/update-tab.dto");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
let TabController = class TabController {
    tabService;
    constructor(tabService) {
        this.tabService = tabService;
    }
    listTabs(user) {
        return this.tabService.listTabs(user.businessId);
    }
    openTab(user) {
        return this.tabService.openTab(user.businessId, user.locationId || '', user.sub);
    }
    getTab(user, id) {
        return this.tabService.getTab(user.businessId, id);
    }
    updateTab(user, id, dto) {
        return this.tabService.updateTab(user.businessId, id, dto);
    }
    holdTab(user, id) {
        return this.tabService.holdTab(user.businessId, id);
    }
    resumeTab(user, id) {
        return this.tabService.resumeTab(user.businessId, id);
    }
    parkTab(user, id) {
        return this.tabService.parkTab(user.businessId, id);
    }
    closeTab(user, id) {
        return this.tabService.closeTab(user.businessId, id);
    }
};
exports.TabController = TabController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TabController.prototype, "listTabs", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TabController.prototype, "openTab", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TabController.prototype, "getTab", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_tab_dto_1.UpdateTabDto]),
    __metadata("design:returntype", void 0)
], TabController.prototype, "updateTab", null);
__decorate([
    (0, common_1.Post)(':id/hold'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TabController.prototype, "holdTab", null);
__decorate([
    (0, common_1.Post)(':id/resume'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TabController.prototype, "resumeTab", null);
__decorate([
    (0, common_1.Post)(':id/park'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TabController.prototype, "parkTab", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TabController.prototype, "closeTab", null);
exports.TabController = TabController = __decorate([
    (0, common_1.Controller)('sales/tabs'),
    __metadata("design:paramtypes", [tab_service_1.TabService])
], TabController);
//# sourceMappingURL=tab.controller.js.map