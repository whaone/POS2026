import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../core/database/database.module';
import {
  locations,
  Location,
  NewLocation,
} from '../../db/schema/location.schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationService {
  constructor(
    @Inject(DATABASE_TOKEN)
    private readonly db: NodePgDatabase,
  ) {}

  async create(
    businessId: string,
    createLocationDto: CreateLocationDto,
  ): Promise<Location> {
    const data: NewLocation = {
      businessId,
      name: createLocationDto.name,
      type: createLocationDto.type,
      address: createLocationDto.address,
    };

    const result = await this.db.insert(locations).values(data).returning();
    return result[0];
  }

  async findAllByBusiness(businessId: string): Promise<Location[]> {
    return this.db
      .select()
      .from(locations)
      .where(eq(locations.businessId, businessId));
  }

  async findOne(businessId: string, id: string): Promise<Location> {
    const result = await this.db
      .select()
      .from(locations)
      .where(and(eq(locations.id, id), eq(locations.businessId, businessId)))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    return result[0];
  }

  async update(
    businessId: string,
    id: string,
    updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    await this.findOne(businessId, id);

    const updateData = {
      ...updateLocationDto,
      updatedAt: new Date(),
    };

    const result = await this.db
      .update(locations)
      .set(updateData)
      .where(and(eq(locations.id, id), eq(locations.businessId, businessId)))
      .returning();

    return result[0];
  }

  async remove(businessId: string, id: string): Promise<void> {
    await this.findOne(businessId, id);
    await this.db
      .delete(locations)
      .where(and(eq(locations.id, id), eq(locations.businessId, businessId)));
  }
}
