import { Injectable, Inject } from '@nestjs/common';
import { and, eq, gte, lte, inArray, desc, asc, sql, type SQL } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { DATABASE_TOKEN } from '../../../core/database/database.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sales, saleItems } from '../../../db/schema/sales.schema';
import { purchases } from '../../../db/schema/purchase.schema';
import { stock } from '../../../db/schema/stock.schema';
import { stockSerials } from '../../../db/schema/stock.schema';
import { products } from '../../../db/schema/product.schema';
import { expenses, commissionAgents, users } from '../../../db/schema/user.schema';
import { contacts } from '../../../db/schema/contact.schema';
import { shifts, cashMovements } from '../../../db/schema/cash-register.schema';
import { vouchers, voucherRedemptions } from '../../../db/schema/pricing.schema';

/** Sales in these states represent completed revenue (not parked carts). */
const COMPLETED_SALE_STATUSES = ['paid', 'partial', 'credit'];
/** Units at or below this on-hand qty count as low stock. */
const LOW_STOCK_THRESHOLD = 10;
/** Days ahead that count as "nearing expiry". */
const EXPIRY_WINDOW_DAYS = 30;
/** Commission agent rate is stored as percentage * 100 (5.5% => 550). */
const RATE_DIVISOR = 10000;

/** Coerce a Drizzle numeric/sum result (string | null) to a finite integer. */
function toInt(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

@Injectable()
export class ReportsService {
  constructor(
    @Inject(DATABASE_TOKEN)
    private readonly db: NodePgDatabase,
  ) {}

  /** Build an optional createdAt/date BETWEEN filter from ISO date strings. */
  private dateRange(
    column: AnyPgColumn,
    startDate?: string,
    endDate?: string,
  ): SQL[] {
    const filters: SQL[] = [];
    if (startDate) filters.push(gte(column, new Date(startDate)));
    if (endDate) filters.push(lte(column, new Date(endDate)));
    return filters;
  }

  async getProfitLoss(businessId: string, startDate?: string, endDate?: string) {
    const [salesAgg] = await this.db
      .select({ total: sql<number>`coalesce(sum(${sales.grandTotal}), 0)` })
      .from(sales)
      .where(
        and(
          eq(sales.businessId, businessId),
          inArray(sales.status, COMPLETED_SALE_STATUSES),
          ...this.dateRange(sales.createdAt, startDate, endDate),
        ),
      );

    const [purchaseAgg] = await this.db
      .select({ total: sql<number>`coalesce(sum(${purchases.grandTotal}), 0)` })
      .from(purchases)
      .where(
        and(
          eq(purchases.businessId, businessId),
          ...this.dateRange(purchases.createdAt, startDate, endDate),
        ),
      );

    const [expenseAgg] = await this.db
      .select({ total: sql<number>`coalesce(sum(${expenses.amount}), 0)` })
      .from(expenses)
      .where(
        and(
          eq(expenses.businessId, businessId),
          ...this.dateRange(expenses.date, startDate, endDate),
        ),
      );

    const totalSales = toInt(salesAgg?.total);
    const totalPurchases = toInt(purchaseAgg?.total);
    const totalExpenses = toInt(expenseAgg?.total);

    return {
      totalSales,
      totalPurchases,
      totalExpenses,
      netProfit: totalSales - totalPurchases - totalExpenses,
    };
  }

  async getPurchaseSellReport(
    businessId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const [purchaseAgg] = await this.db
      .select({
        total: sql<number>`coalesce(sum(${purchases.grandTotal}), 0)`,
        tax: sql<number>`coalesce(sum(${purchases.taxTotal}), 0)`,
      })
      .from(purchases)
      .where(
        and(
          eq(purchases.businessId, businessId),
          ...this.dateRange(purchases.createdAt, startDate, endDate),
        ),
      );

    const [salesAgg] = await this.db
      .select({
        total: sql<number>`coalesce(sum(${sales.grandTotal}), 0)`,
        tax: sql<number>`coalesce(sum(${sales.taxTotal}), 0)`,
      })
      .from(sales)
      .where(
        and(
          eq(sales.businessId, businessId),
          inArray(sales.status, COMPLETED_SALE_STATUSES),
          ...this.dateRange(sales.createdAt, startDate, endDate),
        ),
      );

    return {
      purchases: {
        total: toInt(purchaseAgg?.total),
        tax: toInt(purchaseAgg?.tax),
      },
      sales: { total: toInt(salesAgg?.total), tax: toInt(salesAgg?.tax) },
    };
  }

  async getStockReport(businessId: string) {
    // Value each on-hand unit at the lowest configured price for its product
    // (deterministic when a product has multiple price groups).
    const [valueAgg] = await this.db
      .select({
        totalValue: sql<number>`coalesce(sum(${stock.qty} * coalesce((select min(price) from product_prices pp where pp.product_id = ${stock.productId}), 0)), 0)`,
        totalUnits: sql<number>`coalesce(sum(${stock.qty}), 0)`,
      })
      .from(stock)
      .where(eq(stock.businessId, businessId));

    const lowStockItems = await this.db
      .select({
        productId: stock.productId,
        name: products.name,
        sku: products.sku,
        qty: stock.qty,
        locationId: stock.locationId,
      })
      .from(stock)
      .innerJoin(products, eq(stock.productId, products.id))
      .where(
        and(
          eq(stock.businessId, businessId),
          lte(stock.qty, LOW_STOCK_THRESHOLD),
        ),
      )
      .orderBy(asc(stock.qty))
      .limit(50);

    const horizon = new Date();
    horizon.setDate(horizon.getDate() + EXPIRY_WINDOW_DAYS);
    const nearingExpiry = await this.db
      .select({
        stockId: stockSerials.stockId,
        lotNumber: stockSerials.lotNumber,
        expiryDate: stockSerials.expiryDate,
        name: products.name,
      })
      .from(stockSerials)
      .innerJoin(stock, eq(stockSerials.stockId, stock.id))
      .innerJoin(products, eq(stock.productId, products.id))
      .where(
        and(
          eq(stock.businessId, businessId),
          lte(stockSerials.expiryDate, horizon),
        ),
      )
      .orderBy(asc(stockSerials.expiryDate))
      .limit(50);

    return {
      totalValue: toInt(valueAgg?.totalValue),
      totalUnits: toInt(valueAgg?.totalUnits),
      lowStockItems,
      nearingExpiry,
    };
  }

  async getTaxReport(businessId: string, startDate?: string, endDate?: string) {
    const [output] = await this.db
      .select({ tax: sql<number>`coalesce(sum(${sales.taxTotal}), 0)` })
      .from(sales)
      .where(
        and(
          eq(sales.businessId, businessId),
          inArray(sales.status, COMPLETED_SALE_STATUSES),
          ...this.dateRange(sales.createdAt, startDate, endDate),
        ),
      );

    const [input] = await this.db
      .select({ tax: sql<number>`coalesce(sum(${purchases.taxTotal}), 0)` })
      .from(purchases)
      .where(
        and(
          eq(purchases.businessId, businessId),
          ...this.dateRange(purchases.createdAt, startDate, endDate),
        ),
      );

    const inputTax = toInt(input?.tax);
    const outputTax = toInt(output?.tax);
    return { inputTax, outputTax, taxPayable: outputTax - inputTax };
  }

  async getExpenseReport(
    businessId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const byCategory = await this.db
      .select({
        category: expenses.category,
        total: sql<number>`coalesce(sum(${expenses.amount}), 0)`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.businessId, businessId),
          ...this.dateRange(expenses.date, startDate, endDate),
        ),
      )
      .groupBy(expenses.category)
      .orderBy(desc(sql`coalesce(sum(${expenses.amount}), 0)`));

    const totalExpenses = byCategory.reduce(
      (sum, row) => sum + toInt(row.total),
      0,
    );

    return {
      totalExpenses,
      byCategory: byCategory.map((row) => ({
        category: row.category,
        total: toInt(row.total),
      })),
    };
  }

  async getContactsReport(businessId: string) {
    const [receivableAgg] = await this.db
      .select({
        total: sql<number>`coalesce(sum(${sales.grandTotal} - ${sales.paidTotal}), 0)`,
      })
      .from(sales)
      .where(
        and(
          eq(sales.businessId, businessId),
          inArray(sales.status, ['partial', 'credit']),
        ),
      );

    const [payableAgg] = await this.db
      .select({
        total: sql<number>`coalesce(sum(${purchases.grandTotal} - ${purchases.paidTotal}), 0)`,
      })
      .from(purchases)
      .where(eq(purchases.businessId, businessId));

    const allContacts = await this.db
      .select()
      .from(contacts)
      .where(eq(contacts.businessId, businessId));

    return {
      totalReceivable: toInt(receivableAgg?.total),
      totalPayable: toInt(payableAgg?.total),
      customers: allContacts.filter(
        (c) => c.type === 'customer' || c.type === 'both',
      ),
      suppliers: allContacts.filter(
        (c) => c.type === 'supplier' || c.type === 'both',
      ),
    };
  }

  async getCashRegisterReport(businessId: string) {
    const shiftRows = await this.db
      .select()
      .from(shifts)
      .where(eq(shifts.businessId, businessId))
      .orderBy(desc(shifts.openedAt))
      .limit(50);

    const [flow] = await this.db
      .select({
        cashIn: sql<number>`coalesce(sum(case when ${cashMovements.type} in ('in', 'sale') then ${cashMovements.amount} else 0 end), 0)`,
        cashOut: sql<number>`coalesce(sum(case when ${cashMovements.type} in ('out', 'refund', 'expense') then ${cashMovements.amount} else 0 end), 0)`,
      })
      .from(cashMovements)
      .innerJoin(shifts, eq(cashMovements.shiftId, shifts.id))
      .where(eq(shifts.businessId, businessId));

    const difference = shiftRows.reduce(
      (sum, s) => sum + toInt(s.difference),
      0,
    );

    return {
      totalCashIn: toInt(flow?.cashIn),
      totalCashOut: toInt(flow?.cashOut),
      difference,
      shifts: shiftRows,
    };
  }

  async getSalespersonReport(businessId: string) {
    const rows = await this.db
      .select({
        agentId: sales.commissionAgentId,
        name: users.name,
        rate: commissionAgents.rate,
        totalSales: sql<number>`coalesce(sum(${sales.grandTotal}), 0)`,
      })
      .from(sales)
      .innerJoin(
        commissionAgents,
        eq(sales.commissionAgentId, commissionAgents.id),
      )
      .innerJoin(users, eq(commissionAgents.userId, users.id))
      .where(
        and(
          eq(sales.businessId, businessId),
          inArray(sales.status, COMPLETED_SALE_STATUSES),
        ),
      )
      .groupBy(sales.commissionAgentId, users.name, commissionAgents.rate);

    const commissions = rows.map((row) => {
      const totalSales = toInt(row.totalSales);
      return {
        agentId: row.agentId,
        name: row.name,
        ratePercent: toInt(row.rate) / 100,
        totalSales,
        commission: Math.round((totalSales * toInt(row.rate)) / RATE_DIVISOR),
      };
    });

    return {
      commissions,
      totalSales: commissions.reduce((sum, c) => sum + c.totalSales, 0),
    };
  }

  async getProductPerformance(businessId: string) {
    const ranked = await this.db
      .select({
        productId: saleItems.productId,
        name: products.name,
        sku: products.sku,
        unitsSold: sql<number>`coalesce(sum(${saleItems.qty}), 0)`,
      })
      .from(saleItems)
      .innerJoin(sales, eq(saleItems.saleId, sales.id))
      .innerJoin(products, eq(saleItems.productId, products.id))
      .where(
        and(
          eq(sales.businessId, businessId),
          inArray(sales.status, COMPLETED_SALE_STATUSES),
        ),
      )
      .groupBy(saleItems.productId, products.name, products.sku)
      .orderBy(desc(sql`coalesce(sum(${saleItems.qty}), 0)`));

    const mapped = ranked.map((row) => ({
      productId: row.productId,
      name: row.name,
      sku: row.sku,
      unitsSold: toInt(row.unitsSold),
    }));

    return {
      fastMoving: mapped.slice(0, 10),
      slowMoving: [...mapped].reverse().slice(0, 10),
    };
  }

  async getVoucherReport(businessId: string) {
    const [issued] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(vouchers)
      .where(eq(vouchers.businessId, businessId));

    const [redeemed] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(voucherRedemptions)
      .innerJoin(vouchers, eq(voucherRedemptions.voucherId, vouchers.id))
      .where(eq(vouchers.businessId, businessId));

    // Outstanding liability = face value of still-active fixed-amount vouchers.
    const [liability] = await this.db
      .select({ total: sql<number>`coalesce(sum(${vouchers.value}), 0)` })
      .from(vouchers)
      .where(
        and(
          eq(vouchers.businessId, businessId),
          eq(vouchers.status, 'active'),
          eq(vouchers.type, 'fixed'),
        ),
      );

    return {
      totalIssued: toInt(issued?.count),
      totalRedeemed: toInt(redeemed?.count),
      liability: toInt(liability?.total),
    };
  }
}
