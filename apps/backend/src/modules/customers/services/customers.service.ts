import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import { customers } from '../../../db/schema/customer.schema';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(@Inject('DB_CLIENT') private readonly db: NodePgDatabase) {}

  async create(businessId: string, createCustomerDto: CreateCustomerDto) {
    const [customer] = await this.db
      .insert(customers)
      .values({
        businessId,
        name: createCustomerDto.name,
        phone: createCustomerDto.phone,
        email: createCustomerDto.email,
        category: createCustomerDto.category || 'retail',
        priceGroupId: createCustomerDto.priceGroupId,
      })
      .returning();

    return customer;
  }

  async findAll(businessId: string) {
    return this.db
      .select()
      .from(customers)
      .where(eq(customers.businessId, businessId));
  }

  async findOne(businessId: string, id: string) {
    const [customer] = await this.db
      .select()
      .from(customers)
      .where(and(eq(customers.id, id), eq(customers.businessId, businessId)));

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(
    businessId: string,
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ) {
    const [updated] = await this.db
      .update(customers)
      .set({
        ...updateCustomerDto,
        updatedAt: new Date(),
      })
      .where(and(eq(customers.id, id), eq(customers.businessId, businessId)))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return updated;
  }

  async remove(businessId: string, id: string) {
    const [deleted] = await this.db
      .delete(customers)
      .where(and(eq(customers.id, id), eq(customers.businessId, businessId)))
      .returning();

    if (!deleted) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return deleted;
  }
}
