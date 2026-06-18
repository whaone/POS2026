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
exports.AccountingService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_module_1 = require("../../../core/database/database.module");
const accounting_schema_1 = require("../../../db/schema/accounting.schema");
let AccountingService = class AccountingService {
    db;
    constructor(db) {
        this.db = db;
    }
    async createAccount(businessId, dto) {
        const [account] = await this.db
            .insert(accounting_schema_1.accounts)
            .values({
            businessId,
            name: dto.name,
            type: dto.type,
            openingBalance: dto.openingBalance || 0,
            balance: dto.openingBalance || 0,
        })
            .returning();
        return account;
    }
    async findAllAccounts(businessId) {
        return this.db
            .select()
            .from(accounting_schema_1.accounts)
            .where((0, drizzle_orm_1.eq)(accounting_schema_1.accounts.businessId, businessId));
    }
    async findAccount(businessId, id) {
        const [account] = await this.db
            .select()
            .from(accounting_schema_1.accounts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(accounting_schema_1.accounts.id, id), (0, drizzle_orm_1.eq)(accounting_schema_1.accounts.businessId, businessId)));
        if (!account) {
            throw new common_1.NotFoundException('Account not found');
        }
        return account;
    }
    async updateAccount(businessId, id, dto) {
        await this.findAccount(businessId, id);
        const [updated] = await this.db
            .update(accounting_schema_1.accounts)
            .set({
            ...dto,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(accounting_schema_1.accounts.id, id))
            .returning();
        return updated;
    }
    async deleteAccount(businessId, id) {
        await this.findAccount(businessId, id);
        const journalUsage = await this.db
            .select()
            .from(accounting_schema_1.journalLines)
            .where((0, drizzle_orm_1.eq)(accounting_schema_1.journalLines.accountId, id))
            .limit(1);
        if (journalUsage.length > 0) {
            throw new common_1.BadRequestException('Cannot delete account with journal entries');
        }
        await this.db.delete(accounting_schema_1.accounts).where((0, drizzle_orm_1.eq)(accounting_schema_1.accounts.id, id));
        return { success: true };
    }
};
exports.AccountingService = AccountingService;
exports.AccountingService = AccountingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [Function])
], AccountingService);
//# sourceMappingURL=accounting.service.js.map