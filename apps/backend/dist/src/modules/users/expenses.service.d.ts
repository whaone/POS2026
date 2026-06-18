import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
export declare class ExpensesService {
    private readonly db;
    constructor(db: NodePgDatabase);
    create(businessId: string, dto: CreateExpenseDto): Promise<{
        date: Date;
        id: string;
        createdAt: Date;
        businessId: string;
        accountId: string | null;
        locationId: string;
        category: string;
        amount: number;
        note: string | null;
    }>;
    findAll(businessId: string): Promise<{
        id: string;
        businessId: string;
        locationId: string;
        category: string;
        amount: number;
        accountId: string | null;
        date: Date;
        note: string | null;
        createdAt: Date;
    }[]>;
    findOne(businessId: string, id: string): Promise<{
        id: string;
        businessId: string;
        locationId: string;
        category: string;
        amount: number;
        accountId: string | null;
        date: Date;
        note: string | null;
        createdAt: Date;
    }>;
    update(businessId: string, id: string, dto: UpdateExpenseDto): Promise<{
        id: string;
        businessId: string;
        locationId: string;
        category: string;
        amount: number;
        accountId: string | null;
        date: Date;
        note: string | null;
        createdAt: Date;
    }>;
    remove(businessId: string, id: string): Promise<{
        success: boolean;
    }>;
}
