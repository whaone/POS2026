import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../core/database/database.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { payrolls } from '../../db/schema/user.schema';
import { CreatePayrollDto, UpdatePayrollDto } from './dto/payroll.dto';

@Injectable()
export class PayrollsService {
  constructor(
    @Inject(DATABASE_TOKEN)
    private readonly db: NodePgDatabase,
  ) {}

  async create(businessId: string, dto: CreatePayrollDto) {
    const [payroll] = await this.db
      .insert(payrolls)
      .values({
        businessId,
        ...dto,
      })
      .returning();
    return payroll;
  }

  async findAll(businessId: string) {
    return this.db
      .select()
      .from(payrolls)
      .where(eq(payrolls.businessId, businessId));
  }

  async findOne(businessId: string, id: string) {
    const [payroll] = await this.db
      .select()
      .from(payrolls)
      .where(and(eq(payrolls.id, id), eq(payrolls.businessId, businessId)));

    if (!payroll) {
      throw new NotFoundException('Payroll not found');
    }
    return payroll;
  }

  async update(businessId: string, id: string, dto: UpdatePayrollDto) {
    await this.findOne(businessId, id);

    const [updated] = await this.db
      .update(payrolls)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(payrolls.id, id))
      .returning();
    return updated;
  }

  async remove(businessId: string, id: string) {
    await this.findOne(businessId, id);
    await this.db.delete(payrolls).where(eq(payrolls.id, id));
    return { success: true };
  }
}
