import { ReportsService } from '../services/reports.service';
import type { RequestWithUser } from '../../auth/auth.types';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getProfitLoss(req: RequestWithUser, startDate?: string, endDate?: string): {
        totalSales: number;
        totalPurchases: number;
        totalExpenses: number;
        netProfit: number;
    };
    getPurchaseSell(req: RequestWithUser, startDate?: string, endDate?: string): {
        purchases: {
            total: number;
            tax: number;
            items: never[];
        };
        sales: {
            total: number;
            tax: number;
            items: never[];
        };
    };
    getStock(req: RequestWithUser): {
        totalValue: number;
        lowStockItems: never[];
        nearingExpiry: never[];
    };
    getTax(req: RequestWithUser): {
        inputTax: number;
        outputTax: number;
        taxPayable: number;
    };
    getExpense(req: RequestWithUser): {
        totalExpenses: number;
        byCategory: never[];
    };
    getContacts(req: RequestWithUser): {
        totalReceivable: number;
        totalPayable: number;
        customers: never[];
        suppliers: never[];
    };
    getCashRegister(req: RequestWithUser): {
        totalCashIn: number;
        totalCashOut: number;
        difference: number;
        shifts: never[];
    };
    getSalesperson(req: RequestWithUser): {
        commissions: never[];
        totalSales: number;
    };
    getProductPerformance(req: RequestWithUser): {
        fastMoving: never[];
        slowMoving: never[];
    };
    getVoucherReport(req: RequestWithUser): {
        totalIssued: number;
        totalRedeemed: number;
        liability: number;
    };
}
