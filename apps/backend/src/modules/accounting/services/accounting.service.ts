import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and, between } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../../core/database/database.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  accounts,
  journalEntries,
  journalLines,
} from '../../../db/schema/accounting.schema';
import { CreateAccountDto, UpdateAccountDto } from '../dto/accounting.dto';

@Injectable()
export class AccountingService {
  constructor(
    @Inject(DATABASE_TOKEN)
    private readonly db: NodePgDatabase,
  ) {}

  async createAccount(businessId: string, dto: CreateAccountDto) {
    const [account] = await this.db
      .insert(accounts)
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

  async findAllAccounts(businessId: string) {
    return this.db
      .select()
      .from(accounts)
      .where(eq(accounts.businessId, businessId));
  }

  async findAccount(businessId: string, id: string) {
    const [account] = await this.db
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, id), eq(accounts.businessId, businessId)));

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async updateAccount(businessId: string, id: string, dto: UpdateAccountDto) {
    await this.findAccount(businessId, id);

    const [updated] = await this.db
      .update(accounts)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, id))
      .returning();

    return updated;
  }

  async deleteAccount(businessId: string, id: string) {
    await this.findAccount(businessId, id);

    const journalUsage = await this.db
      .select()
      .from(journalLines)
      .where(eq(journalLines.accountId, id))
      .limit(1);

    if (journalUsage.length > 0) {
      throw new BadRequestException(
        'Cannot delete account with journal entries',
      );
    }

    await this.db.delete(accounts).where(eq(accounts.id, id));

    return { success: true };
  }

  async getAccountReport(
    businessId: string,
    id: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const account = await this.findAccount(businessId, id);

    let query = this.db
      .select({
        id: journalLines.id,
        debit: journalLines.debit,
        credit: journalLines.credit,
        date: journalEntries.date,
        memo: journalEntries.memo,
        refType: journalEntries.refType,
      })
      .from(journalLines)
      .innerJoin(
        journalEntries,
        eq(journalLines.journalEntryId, journalEntries.id),
      )
      .where(
        and(
          eq(journalLines.accountId, id),
          eq(journalEntries.businessId, businessId),
        ),
      );

    if (startDate && endDate) {
      query = this.db
        .select({
          id: journalLines.id,
          debit: journalLines.debit,
          credit: journalLines.credit,
          date: journalEntries.date,
          memo: journalEntries.memo,
          refType: journalEntries.refType,
        })
        .from(journalLines)
        .innerJoin(
          journalEntries,
          eq(journalLines.journalEntryId, journalEntries.id),
        )
        .where(
          and(
            eq(journalLines.accountId, id),
            eq(journalEntries.businessId, businessId),
            between(journalEntries.date, startDate, endDate),
          ),
        );
    }

    const mutations = await query;
    return { account, mutations };
  }

  async getTrialBalance(businessId: string) {
    // A simple trial balance lists all accounts and their current balances
    // In our simplified schema, we use the `balance` field of accounts directly
    // since it's meant to be updated with each transaction
    const allAccounts = await this.findAllAccounts(businessId);
    let totalDebit = 0;
    let totalCredit = 0;

    const items = allAccounts.map((acc) => {
      const isDebitAccount =
        acc.type === 'cash' ||
        acc.type === 'bank' ||
        acc.type === 'ewallet' ||
        acc.type === 'expense';

      // If it's a debit normal account, positive balance means debit
      if (isDebitAccount) {
        if (acc.balance >= 0) {
          totalDebit += acc.balance;
          return { ...acc, debit: acc.balance, credit: 0 };
        } else {
          totalCredit += Math.abs(acc.balance);
          return { ...acc, debit: 0, credit: Math.abs(acc.balance) };
        }
      } else {
        // Credit normal account
        if (acc.balance >= 0) {
          totalCredit += acc.balance;
          return { ...acc, debit: 0, credit: acc.balance };
        } else {
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

  async getBalanceSheet(businessId: string) {
    const allAccounts = await this.findAllAccounts(businessId);

    // In a real system, you'd split by Assets, Liabilities, Equity based on account types
    const assets = allAccounts.filter((a) =>
      ['cash', 'bank', 'ewallet'].includes(a.type),
    );
    const liabilities = allAccounts.filter((a) =>
      ['payable', 'credit_card'].includes(a.type),
    );
    const equity = allAccounts.filter((a) => ['equity'].includes(a.type));

    const sumBalance = (accs: { balance: number }[]) =>
      accs.reduce((sum, a) => sum + a.balance, 0);

    return {
      assets: { items: assets, total: sumBalance(assets) },
      liabilities: { items: liabilities, total: sumBalance(liabilities) },
      equity: { items: equity, total: sumBalance(equity) },
    };
  }

  getCashFlow(businessId: string, startDate?: Date, endDate?: Date) {
    // Return mock data for cash flow report based on requirements
    return {
      message: 'Cash flow report',
      period: { start: startDate, end: endDate },
      operatingActivities: { inflow: 0, outflow: 0, net: 0 },
      investingActivities: { inflow: 0, outflow: 0, net: 0 },
      financingActivities: { inflow: 0, outflow: 0, net: 0 },
      netIncreaseInCash: 0,
    };
  }
}
