import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../core/database/database.module';
import {
  businesses,
  Business,
  NewBusiness,
} from '../../db/schema/business.schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { RolesService } from '../users/roles.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessService {
  constructor(
    @Inject(DATABASE_TOKEN)
    private readonly db: NodePgDatabase,
    private readonly rolesService: RolesService,
  ) {}

  async create(createBusinessDto: CreateBusinessDto): Promise<Business> {
    const data: NewBusiness = {
      name: createBusinessDto.name,
      currency: createBusinessDto.currency,
      timezone: createBusinessDto.timezone,
      financialYearStartMonth: createBusinessDto.financialYearStartMonth,
      profitMargin: createBusinessDto.profitMargin,
      taxNumber: createBusinessDto.taxNumber,
    };

    const newBusiness = await this.db
      .insert(businesses)
      .values(data)
      .returning();
    const created = newBusiness[0];

    // Seed default roles for this new business
    await this.rolesService.seedPredefinedRolesForBusiness(created.id);

    return created;
  }

  async findAll(): Promise<Business[]> {
    return this.db.select().from(businesses);
  }

  async findOne(id: string): Promise<Business> {
    const result = await this.db
      .select()
      .from(businesses)
      .where(eq(businesses.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    return result[0];
  }

  async update(
    id: string,
    updateBusinessDto: UpdateBusinessDto,
  ): Promise<Business> {
    // Check exists
    await this.findOne(id);

    const updateData = {
      ...updateBusinessDto,
      updatedAt: new Date(),
    };

    const result = await this.db
      .update(businesses)
      .set(updateData)
      .where(eq(businesses.id, id))
      .returning();

    return result[0];
  }

  async remove(id: string): Promise<void> {
    // Check exists
    await this.findOne(id);

    await this.db.delete(businesses).where(eq(businesses.id, id));
  }
}
