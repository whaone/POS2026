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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../../core/database/database.module");
let ReportsService = class ReportsService {
    db;
    constructor(db) {
        this.db = db;
    }
    getProfitLoss(_businessId, _startDate, _endDate) {
        return {
            totalSales: 1500000,
            totalPurchases: 800000,
            totalExpenses: 200000,
            netProfit: 500000,
        };
    }
    getPurchaseSellReport(_businessId, _startDate, _endDate) {
        return {
            purchases: { total: 800000, tax: 80000, items: [] },
            sales: { total: 1500000, tax: 150000, items: [] },
        };
    }
    getStockReport(_businessId) {
        return {
            totalValue: 5000000,
            lowStockItems: [],
            nearingExpiry: [],
        };
    }
    getTaxReport(_businessId) {
        return {
            inputTax: 80000,
            outputTax: 150000,
            taxPayable: 70000,
        };
    }
    getExpenseReport(_businessId) {
        return {
            totalExpenses: 200000,
            byCategory: [],
        };
    }
    getContactsReport(_businessId) {
        return {
            totalReceivable: 50000,
            totalPayable: 120000,
            customers: [],
            suppliers: [],
        };
    }
    getCashRegisterReport(_businessId) {
        return {
            totalCashIn: 1500000,
            totalCashOut: 200000,
            difference: 0,
            shifts: [],
        };
    }
    getSalespersonReport(_businessId) {
        return {
            commissions: [],
            totalSales: 1500000,
        };
    }
    getProductPerformance(_businessId) {
        return {
            fastMoving: [],
            slowMoving: [],
        };
    }
    getVoucherReport(_businessId) {
        return {
            totalIssued: 1000,
            totalRedeemed: 450,
            liability: 550000,
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [Function])
], ReportsService);
//# sourceMappingURL=reports.service.js.map