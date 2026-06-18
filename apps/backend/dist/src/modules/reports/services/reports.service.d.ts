import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
export declare class ReportsService {
    private readonly db;
    constructor(db: NodePgDatabase);
    getProfitLoss(_businessId: string, _startDate?: string, _endDate?: string): {
        totalSales: number;
        totalPurchases: number;
        totalExpenses: number;
        netProfit: number;
    };
    getPurchaseSellReport(_businessId: string, _startDate?: string, _endDate?: string): {
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
    getStockReport(_businessId: string): {
        totalValue: number;
        lowStockItems: never[];
        nearingExpiry: never[];
    };
    getTaxReport(_businessId: string): {
        inputTax: number;
        outputTax: number;
        taxPayable: number;
    };
    getExpenseReport(_businessId: string): {
        totalExpenses: number;
        byCategory: never[];
    };
    getContactsReport(_businessId: string): {
        totalReceivable: number;
        totalPayable: number;
        customers: never[];
        suppliers: never[];
    };
    getCashRegisterReport(_businessId: string): {
        totalCashIn: number;
        totalCashOut: number;
        difference: number;
        shifts: never[];
    };
    getSalespersonReport(_businessId: string): {
        commissions: never[];
        totalSales: number;
    };
    getProductPerformance(_businessId: string): {
        fastMoving: never[];
        slowMoving: never[];
    };
    getVoucherReport(_businessId: string): {
        totalIssued: number;
        totalRedeemed: number;
        liability: number;
    };
}
