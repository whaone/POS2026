/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../../core/database/database.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class ReportsService {
  constructor(
    @Inject(DATABASE_TOKEN)
    private readonly db: NodePgDatabase,
  ) {}

  getProfitLoss(_businessId: string, _startDate?: string, _endDate?: string) {
    return {
      totalSales: 1500000,
      totalPurchases: 800000,
      totalExpenses: 200000,
      netProfit: 500000,
    };
  }

  getPurchaseSellReport(
    _businessId: string,
    _startDate?: string,
    _endDate?: string,
  ) {
    return {
      purchases: { total: 800000, tax: 80000, items: [] },
      sales: { total: 1500000, tax: 150000, items: [] },
    };
  }

  getStockReport(_businessId: string) {
    return {
      totalValue: 5000000,
      lowStockItems: [],
      nearingExpiry: [],
    };
  }

  getTaxReport(_businessId: string) {
    return {
      inputTax: 80000,
      outputTax: 150000,
      taxPayable: 70000,
    };
  }

  getExpenseReport(_businessId: string) {
    return {
      totalExpenses: 200000,
      byCategory: [],
    };
  }

  getContactsReport(_businessId: string) {
    return {
      totalReceivable: 50000,
      totalPayable: 120000,
      customers: [],
      suppliers: [],
    };
  }

  getCashRegisterReport(_businessId: string) {
    return {
      totalCashIn: 1500000,
      totalCashOut: 200000,
      difference: 0,
      shifts: [],
    };
  }

  getSalespersonReport(_businessId: string) {
    return {
      commissions: [],
      totalSales: 1500000,
    };
  }

  getProductPerformance(_businessId: string) {
    return {
      fastMoving: [],
      slowMoving: [],
    };
  }

  getVoucherReport(_businessId: string) {
    return {
      totalIssued: 1000,
      totalRedeemed: 450,
      liability: 550000,
    };
  }
}
