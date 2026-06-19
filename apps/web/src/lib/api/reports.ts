import { ApiClient } from './client';
import type { ProfitLossReport, PurchaseSellReport, StockReport } from '../types/reports';

export class ReportsApi {
	static async getProfitLoss(): Promise<ProfitLossReport> {
		return await ApiClient.get<ProfitLossReport>('/reports/profit-loss');
	}

	static async getPurchaseSell(): Promise<PurchaseSellReport> {
		return await ApiClient.get<PurchaseSellReport>('/reports/purchase-sell');
	}

	static async getStock(): Promise<StockReport> {
		return await ApiClient.get<StockReport>('/reports/stock');
	}

	// Helper to get all basic dashboard metrics concurrently
	static async getDashboardMetrics() {
		const [profitLoss, purchaseSell, stock] = await Promise.all([
			this.getProfitLoss(),
			this.getPurchaseSell(),
			this.getStock()
		]);
		return { profitLoss, purchaseSell, stock };
	}
}
