export interface ProfitLossReport {
	totalSales: number;
	totalPurchases: number;
	totalExpenses: number;
	netProfit: number;
}

export interface PurchaseSellReport {
	purchases: { total: number; tax: number; items: unknown[] };
	sales: { total: number; tax: number; items: unknown[] };
}

export interface StockReport {
	totalValue: number;
	lowStockItems: unknown[];
	nearingExpiry: unknown[];
}

export interface CashRegisterReport {
	totalCashIn: number;
	totalCashOut: number;
	difference: number;
	shifts: unknown[];
}

export interface DashboardMetrics {
	profitLoss: ProfitLossReport;
	purchaseSell: PurchaseSellReport;
	stock: StockReport;
}
