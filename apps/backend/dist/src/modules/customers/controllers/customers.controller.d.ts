import { CustomersService } from '../services/customers.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import type { RequestWithUser } from '../../auth/auth.types';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(req: RequestWithUser, createCustomerDto: CreateCustomerDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        email: string | null;
        category: string;
        priceGroupId: string | null;
        phone: string | null;
    }>;
    findAll(req: RequestWithUser): Promise<{
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
    findOne(req: RequestWithUser, id: string): Promise<{
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
    update(req: RequestWithUser, id: string, updateCustomerDto: UpdateCustomerDto): Promise<{
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
    remove(req: RequestWithUser, id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        email: string | null;
        category: string;
        priceGroupId: string | null;
        phone: string | null;
    }>;
}
