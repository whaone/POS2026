import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
export declare class CustomersService {
    private readonly db;
    constructor(db: NodePgDatabase);
    create(businessId: string, createCustomerDto: CreateCustomerDto): Promise<{
        name: string;
        id: string;
        businessId: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        priceGroupId: string | null;
        phone: string | null;
        category: string;
    }>;
    findAll(businessId: string): Promise<{
        id: string;
        businessId: string;
        name: string;
        phone: string | null;
        email: string | null;
        category: string;
        priceGroupId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(businessId: string, id: string): Promise<{
        id: string;
        businessId: string;
        name: string;
        phone: string | null;
        email: string | null;
        category: string;
        priceGroupId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(businessId: string, id: string, updateCustomerDto: UpdateCustomerDto): Promise<{
        id: string;
        businessId: string;
        name: string;
        phone: string | null;
        email: string | null;
        category: string;
        priceGroupId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(businessId: string, id: string): Promise<{
        name: string;
        id: string;
        businessId: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        priceGroupId: string | null;
        phone: string | null;
        category: string;
    }>;
}
