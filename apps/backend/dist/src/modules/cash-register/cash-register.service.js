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
exports.CashRegisterService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_module_1 = require("../../core/database/database.module");
const cash_register_schema_1 = require("../../db/schema/cash-register.schema");
let CashRegisterService = class CashRegisterService {
    db;
    constructor(db) {
        this.db = db;
    }
    async openRegister(businessId, cashierId, dto) {
        const [existing] = await this.db
            .select()
            .from(cash_register_schema_1.shifts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(cash_register_schema_1.shifts.businessId, businessId), (0, drizzle_orm_1.eq)(cash_register_schema_1.shifts.cashierId, cashierId), (0, drizzle_orm_1.eq)(cash_register_schema_1.shifts.locationId, dto.locationId), (0, drizzle_orm_1.eq)(cash_register_schema_1.shifts.status, 'open')))
            .limit(1);
        if (existing) {
            throw new common_1.ConflictException('Cash register shift already open');
        }
        const [shift] = await this.db
            .insert(cash_register_schema_1.shifts)
            .values({
            businessId,
            locationId: dto.locationId,
            cashierId,
            openingBalance: dto.openingBalance,
            systemCash: dto.openingBalance,
            status: 'open',
        })
            .returning();
        return shift;
    }
    async getCurrent(businessId, cashierId) {
        const [shift] = await this.db
            .select()
            .from(cash_register_schema_1.shifts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(cash_register_schema_1.shifts.businessId, businessId), (0, drizzle_orm_1.eq)(cash_register_schema_1.shifts.cashierId, cashierId), (0, drizzle_orm_1.eq)(cash_register_schema_1.shifts.status, 'open')))
            .limit(1);
        return shift || null;
    }
    async cashIn(businessId, cashierId, dto) {
        const shift = await this.getCurrent(businessId, cashierId);
        if (!shift)
            throw new common_1.NotFoundException('No open shift');
        const [movement] = await this.db
            .insert(cash_register_schema_1.cashMovements)
            .values({
            shiftId: shift.id,
            type: 'in',
            amount: dto.amount,
            ref: dto.ref,
        })
            .returning();
        await this.db
            .update(cash_register_schema_1.shifts)
            .set({ systemCash: shift.systemCash + dto.amount })
            .where((0, drizzle_orm_1.eq)(cash_register_schema_1.shifts.id, shift.id));
        return movement;
    }
    async cashOut(businessId, cashierId, dto) {
        const shift = await this.getCurrent(businessId, cashierId);
        if (!shift)
            throw new common_1.NotFoundException('No open shift');
        const [movement] = await this.db
            .insert(cash_register_schema_1.cashMovements)
            .values({
            shiftId: shift.id,
            type: 'out',
            amount: dto.amount,
            ref: dto.ref,
        })
            .returning();
        await this.db
            .update(cash_register_schema_1.shifts)
            .set({ systemCash: shift.systemCash - dto.amount })
            .where((0, drizzle_orm_1.eq)(cash_register_schema_1.shifts.id, shift.id));
        return movement;
    }
    async closeRegister(businessId, cashierId, dto) {
        const shift = await this.getCurrent(businessId, cashierId);
        if (!shift)
            throw new common_1.NotFoundException('No open shift');
        const difference = dto.closingCounted - shift.systemCash;
        const [closed] = await this.db
            .update(cash_register_schema_1.shifts)
            .set({
            closingCounted: dto.closingCounted,
            difference,
            status: 'closed',
            closedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(cash_register_schema_1.shifts.id, shift.id))
            .returning();
        return closed;
    }
};
exports.CashRegisterService = CashRegisterService;
exports.CashRegisterService = CashRegisterService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [Function])
], CashRegisterService);
//# sourceMappingURL=cash-register.service.js.map