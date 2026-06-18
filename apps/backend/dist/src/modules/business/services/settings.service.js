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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_module_1 = require("../../../core/database/database.module");
const business_schema_1 = require("../../../db/schema/business.schema");
let SettingsService = class SettingsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async createInvoiceTemplate(businessId, dto) {
        const [template] = await this.db
            .insert(business_schema_1.invoiceTemplates)
            .values({
            businessId,
            name: dto.name,
            layoutJson: dto.layoutJson || {},
        })
            .returning();
        return template;
    }
    async findAllInvoiceTemplates(businessId) {
        return this.db
            .select()
            .from(business_schema_1.invoiceTemplates)
            .where((0, drizzle_orm_1.eq)(business_schema_1.invoiceTemplates.businessId, businessId));
    }
    async updateInvoiceTemplate(businessId, id, dto) {
        const [template] = await this.db
            .select()
            .from(business_schema_1.invoiceTemplates)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(business_schema_1.invoiceTemplates.id, id), (0, drizzle_orm_1.eq)(business_schema_1.invoiceTemplates.businessId, businessId)));
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        const [updated] = await this.db
            .update(business_schema_1.invoiceTemplates)
            .set(dto)
            .where((0, drizzle_orm_1.eq)(business_schema_1.invoiceTemplates.id, id))
            .returning();
        return updated;
    }
    async deleteInvoiceTemplate(businessId, id) {
        await this.db
            .delete(business_schema_1.invoiceTemplates)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(business_schema_1.invoiceTemplates.id, id), (0, drizzle_orm_1.eq)(business_schema_1.invoiceTemplates.businessId, businessId)));
        return { success: true };
    }
    async getBarcodeSetting(businessId) {
        const [setting] = await this.db
            .select()
            .from(business_schema_1.barcodeSettings)
            .where((0, drizzle_orm_1.eq)(business_schema_1.barcodeSettings.businessId, businessId))
            .limit(1);
        return setting || null;
    }
    async upsertBarcodeSetting(businessId, dto) {
        const existing = await this.getBarcodeSetting(businessId);
        if (existing) {
            const [updated] = await this.db
                .update(business_schema_1.barcodeSettings)
                .set(dto)
                .where((0, drizzle_orm_1.eq)(business_schema_1.barcodeSettings.id, existing.id))
                .returning();
            return updated;
        }
        else {
            const [created] = await this.db
                .insert(business_schema_1.barcodeSettings)
                .values({
                businessId,
                ...dto,
            })
                .returning();
            return created;
        }
    }
    async createDevice(businessId, dto) {
        const [device] = await this.db
            .insert(business_schema_1.devices)
            .values({
            businessId,
            ...dto,
        })
            .returning();
        return device;
    }
    async findAllDevices(businessId) {
        return this.db
            .select()
            .from(business_schema_1.devices)
            .where((0, drizzle_orm_1.eq)(business_schema_1.devices.businessId, businessId));
    }
    async updateDevice(businessId, id, dto) {
        const [device] = await this.db
            .select()
            .from(business_schema_1.devices)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(business_schema_1.devices.id, id), (0, drizzle_orm_1.eq)(business_schema_1.devices.businessId, businessId)));
        if (!device)
            throw new common_1.NotFoundException('Device not found');
        const [updated] = await this.db
            .update(business_schema_1.devices)
            .set(dto)
            .where((0, drizzle_orm_1.eq)(business_schema_1.devices.id, id))
            .returning();
        return updated;
    }
    async deleteDevice(businessId, id) {
        await this.db
            .delete(business_schema_1.devices)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(business_schema_1.devices.id, id), (0, drizzle_orm_1.eq)(business_schema_1.devices.businessId, businessId)));
        return { success: true };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [Function])
], SettingsService);
//# sourceMappingURL=settings.service.js.map