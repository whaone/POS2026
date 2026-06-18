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
exports.TabService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_module_1 = require("../../../core/database/database.module");
const sales_schema_1 = require("../../../db/schema/sales.schema");
const MAX_TABS = 10;
let TabService = class TabService {
    db;
    constructor(db) {
        this.db = db;
    }
    async listTabs(businessId, shiftId) {
        const whereClause = shiftId
            ? (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(sales_schema_1.transactionTabs.businessId, businessId), (0, drizzle_orm_1.eq)(sales_schema_1.transactionTabs.shiftId, shiftId))
            : (0, drizzle_orm_1.eq)(sales_schema_1.transactionTabs.businessId, businessId);
        return this.db.select().from(sales_schema_1.transactionTabs).where(whereClause);
    }
    async openTab(businessId, locationId, cashierId, shiftId) {
        const countWhere = shiftId
            ? (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(sales_schema_1.transactionTabs.businessId, businessId), (0, drizzle_orm_1.eq)(sales_schema_1.transactionTabs.shiftId, shiftId), (0, drizzle_orm_1.eq)(sales_schema_1.transactionTabs.status, 'active'))
            : (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(sales_schema_1.transactionTabs.businessId, businessId), (0, drizzle_orm_1.eq)(sales_schema_1.transactionTabs.status, 'active'));
        const [countResult] = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(sales_schema_1.transactionTabs)
            .where(countWhere);
        if (countResult && countResult.count >= MAX_TABS) {
            throw new common_1.ConflictException({
                message: `Maximum ${MAX_TABS} tabs allowed per session`,
                code: 'E-TAB-409',
            });
        }
        const existing = await this.db
            .select({ tabIndex: sales_schema_1.transactionTabs.tabIndex })
            .from(sales_schema_1.transactionTabs)
            .where(countWhere);
        const usedIndices = new Set(existing.map((r) => r.tabIndex));
        let nextIndex = 1;
        while (usedIndices.has(nextIndex) && nextIndex <= MAX_TABS) {
            nextIndex++;
        }
        const [newTab] = await this.db
            .insert(sales_schema_1.transactionTabs)
            .values({
            businessId,
            locationId,
            shiftId,
            cashierId,
            tabIndex: nextIndex,
            label: `Tab ${nextIndex}`,
            status: 'active',
            itemCount: 0,
            subtotalAmount: 0,
        })
            .returning();
        return newTab;
    }
    async getTab(businessId, tabId) {
        const [tab] = await this.db
            .select()
            .from(sales_schema_1.transactionTabs)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(sales_schema_1.transactionTabs.id, tabId), (0, drizzle_orm_1.eq)(sales_schema_1.transactionTabs.businessId, businessId)))
            .limit(1);
        if (!tab) {
            throw new common_1.NotFoundException(`Tab ${tabId} not found`);
        }
        return tab;
    }
    async updateTab(businessId, tabId, dto) {
        await this.getTab(businessId, tabId);
        const [updated] = await this.db
            .update(sales_schema_1.transactionTabs)
            .set({ ...dto, updatedAt: new Date() })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(sales_schema_1.transactionTabs.id, tabId), (0, drizzle_orm_1.eq)(sales_schema_1.transactionTabs.businessId, businessId)))
            .returning();
        return updated;
    }
    async holdTab(businessId, tabId) {
        await this.getTab(businessId, tabId);
        const [held] = await this.db
            .update(sales_schema_1.transactionTabs)
            .set({
            status: 'on_hold',
            heldAt: new Date(),
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(sales_schema_1.transactionTabs.id, tabId), (0, drizzle_orm_1.eq)(sales_schema_1.transactionTabs.businessId, businessId)))
            .returning();
        return held;
    }
    async resumeTab(businessId, tabId) {
        await this.getTab(businessId, tabId);
        const [resumed] = await this.db
            .update(sales_schema_1.transactionTabs)
            .set({
            status: 'active',
            heldAt: null,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(sales_schema_1.transactionTabs.id, tabId), (0, drizzle_orm_1.eq)(sales_schema_1.transactionTabs.businessId, businessId)))
            .returning();
        return resumed;
    }
    async parkTab(businessId, tabId) {
        const tab = await this.getTab(businessId, tabId);
        const [parked] = await this.db
            .insert(sales_schema_1.heldCarts)
            .values({
            businessId: tab.businessId,
            locationId: tab.locationId,
            cashierId: tab.cashierId,
            customerId: tab.customerId,
            cartJson: tab.cartJson,
            sourceTabId: tab.id,
        })
            .returning();
        await this.db
            .delete(sales_schema_1.transactionTabs)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(sales_schema_1.transactionTabs.id, tabId), (0, drizzle_orm_1.eq)(sales_schema_1.transactionTabs.businessId, businessId)));
        return parked;
    }
    async closeTab(businessId, tabId) {
        await this.getTab(businessId, tabId);
        await this.db
            .delete(sales_schema_1.transactionTabs)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(sales_schema_1.transactionTabs.id, tabId), (0, drizzle_orm_1.eq)(sales_schema_1.transactionTabs.businessId, businessId)));
        return { deleted: true };
    }
};
exports.TabService = TabService;
exports.TabService = TabService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [Function])
], TabService);
//# sourceMappingURL=tab.service.js.map