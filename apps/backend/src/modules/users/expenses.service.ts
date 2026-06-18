import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../core/database/database.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { expenses } from '../../db/schema/user.schema';

import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @Inject(DATABASE_TOKEN)
    private readonly db: NodePgDatabase,
  ) {}

  async create(businessId: string, dto: CreateExpenseDto) {
    const [expense] = await this.db
      .insert(expenses)
      .values({
        businessId,
        ...dto,
      })
      .returning();
    return expense;
  }

  async findAll(businessId: string) {
    return this.db
      .select()
      .from(expenses)
      .where(eq(expenses.businessId, businessId));
  }

  async findOne(businessId: string, id: string) {
    const [expense] = await this.db
      .select()
      .from(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.businessId, businessId)));

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }
    return expense;
  }

  async update(businessId: string, id: string, dto: UpdateExpenseDto) {
    await this.findOne(businessId, id);

    const [updated] = await this.db
      .update(expenses)
      .set(dto)
      .where(eq(expenses.id, id))
      .returning();
    return updated;
  }

  async remove(businessId: string, id: string) {
    await this.findOne(businessId, id);
    await this.db.delete(expenses).where(eq(expenses.id, id));
    return { success: true };
  }
}
