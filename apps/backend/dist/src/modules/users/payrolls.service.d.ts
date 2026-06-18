import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreatePayrollDto, UpdatePayrollDto } from './dto/payroll.dto';
export declare class PayrollsService {
    private readonly db;
    constructor(db: NodePgDatabase);
    create(businessId: string, dto: CreatePayrollDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        amount: number;
        note: string | null;
        userId: string;
        period: string;
    }>;
    findAll(businessId: string): Promise<{
        id: string;
        businessId: string;
        userId: string;
        period: string;
        amount: number;
        note: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(businessId: string, id: string): Promise<{
        id: string;
        businessId: string;
        userId: string;
        period: string;
        amount: number;
        note: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(businessId: string, id: string, dto: UpdatePayrollDto): Promise<{
        id: string;
        businessId: string;
        userId: string;
        period: string;
        amount: number;
        note: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(businessId: string, id: string): Promise<{
        success: boolean;
    }>;
}
