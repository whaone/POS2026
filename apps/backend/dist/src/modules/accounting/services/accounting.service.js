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
    async getAccountReport(businessId, id, startDate, endDate) {
        const account = await this.findAccount(businessId, id);
        let query = this.db
            .select({
            id: accounting_schema_1.journalLines.id,
            debit: accounting_schema_1.journalLines.debit,
            credit: accounting_schema_1.journalLines.credit,
            date: accounting_schema_1.journalEntries.date,
            memo: accounting_schema_1.journalEntries.memo,
            refType: accounting_schema_1.journalEntries.refType,
        })
            .from(accounting_schema_1.journalLines)
            .innerJoin(accounting_schema_1.journalEntries, (0, drizzle_orm_1.eq)(accounting_schema_1.journalLines.journalEntryId, accounting_schema_1.journalEntries.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(accounting_schema_1.journalLines.accountId, id), (0, drizzle_orm_1.eq)(accounting_schema_1.journalEntries.businessId, businessId)));
        if (startDate && endDate) {
            query = this.db
                .select({
                id: accounting_schema_1.journalLines.id,
                debit: accounting_schema_1.journalLines.debit,
                credit: accounting_schema_1.journalLines.credit,
                date: accounting_schema_1.journalEntries.date,
                memo: accounting_schema_1.journalEntries.memo,
                refType: accounting_schema_1.journalEntries.refType,
            })
                .from(accounting_schema_1.journalLines)
                .innerJoin(accounting_schema_1.journalEntries, (0, drizzle_orm_1.eq)(accounting_schema_1.journalLines.journalEntryId, accounting_schema_1.journalEntries.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(accounting_schema_1.journalLines.accountId, id), (0, drizzle_orm_1.eq)(accounting_schema_1.journalEntries.businessId, businessId), (0, drizzle_orm_1.between)(accounting_schema_1.journalEntries.date, startDate, endDate)));
        }
        const mutations = await query;
        return { account, mutations };
    }
    async getTrialBalance(businessId) {
        const allAccounts = await this.findAllAccounts(businessId);
        let totalDebit = 0;
        let totalCredit = 0;
        const items = allAccounts.map((acc) => {
            const isDebitAccount = acc.type === 'cash' ||
                acc.type === 'bank' ||
                acc.type === 'ewallet' ||
                acc.type === 'expense';
            if (isDebitAccount) {
                if (acc.balance >= 0) {
                    totalDebit += acc.balance;
                    return { ...acc, debit: acc.balance, credit: 0 };
                }
                else {
                    totalCredit += Math.abs(acc.balance);
                    return { ...acc, debit: 0, credit: Math.abs(acc.balance) };
                }
            }
            else {
                if (acc.balance >= 0) {
                    totalCredit += acc.balance;
                    return { ...acc, debit: 0, credit: acc.balance };
                }
                else {
                    totalDebit += Math.abs(acc.balance);
                    return { ...acc, debit: Math.abs(acc.balance), credit: 0 };
                }
            }
        });
        return {
            items,
            totalDebit,
            totalCredit,
            isBalanced: totalDebit === totalCredit,
        };
    }
    async getBalanceSheet(businessId) {
        const allAccounts = await this.findAllAccounts(businessId);
        const assets = allAccounts.filter((a) => ['cash', 'bank', 'ewallet'].includes(a.type));
        const liabilities = allAccounts.filter((a) => ['payable', 'credit_card'].includes(a.type));
        const equity = allAccounts.filter((a) => ['equity'].includes(a.type));
        const sumBalance = (accs) => accs.reduce((sum, a) => sum + a.balance, 0);
        return {
            assets: { items: assets, total: sumBalance(assets) },
            liabilities: { items: liabilities, total: sumBalance(liabilities) },
            equity: { items: equity, total: sumBalance(equity) },
        };
    }
    getCashFlow(businessId, startDate, endDate) {
        return {
            message: 'Cash flow report',
            period: { start: startDate, end: endDate },
            operatingActivities: { inflow: 0, outflow: 0, net: 0 },
            investingActivities: { inflow: 0, outflow: 0, net: 0 },
            financingActivities: { inflow: 0, outflow: 0, net: 0 },
            netIncreaseInCash: 0,
        };
    }
};
exports.AccountingService = AccountingService;
exports.AccountingService = AccountingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [Function])
], AccountingService);
//# sourceMappingURL=accounting.service.js.map