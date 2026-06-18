import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../../core/database/database.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { accounts, journalLines } from '../../../db/schema/accounting.schema';
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
}
