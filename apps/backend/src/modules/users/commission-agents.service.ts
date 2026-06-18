import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../core/database/database.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { commissionAgents } from '../../db/schema/user.schema';
import {
  CreateCommissionAgentDto,
  UpdateCommissionAgentDto,
} from './dto/commission-agent.dto';

@Injectable()
export class CommissionAgentsService {
  constructor(
    @Inject(DATABASE_TOKEN)
    private readonly db: NodePgDatabase,
  ) {}

  async create(businessId: string, dto: CreateCommissionAgentDto) {
    const [agent] = await this.db
      .insert(commissionAgents)
      .values({
        businessId,
        ...dto,
      })
      .returning();
    return agent;
  }

  async findAll(businessId: string) {
    return this.db
      .select()
      .from(commissionAgents)
      .where(eq(commissionAgents.businessId, businessId));
  }

  async findOne(businessId: string, id: string) {
    const [agent] = await this.db
      .select()
      .from(commissionAgents)
      .where(
        and(
          eq(commissionAgents.id, id),
          eq(commissionAgents.businessId, businessId),
        ),
      );

    if (!agent) {
      throw new NotFoundException('Commission Agent not found');
    }
    return agent;
  }

  async update(businessId: string, id: string, dto: UpdateCommissionAgentDto) {
    await this.findOne(businessId, id);

    const [updated] = await this.db
      .update(commissionAgents)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(commissionAgents.id, id))
      .returning();
    return updated;
  }

  async remove(businessId: string, id: string) {
    await this.findOne(businessId, id);
    await this.db.delete(commissionAgents).where(eq(commissionAgents.id, id));
    return { success: true };
  }
}
