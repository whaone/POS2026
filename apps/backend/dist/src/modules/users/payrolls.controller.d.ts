import { PayrollsService } from './payrolls.service';
import type { RequestWithUser } from '../auth/auth.types';
import { CreatePayrollDto, UpdatePayrollDto } from './dto/payroll.dto';
export declare class PayrollsController {
    private readonly service;
    constructor(service: PayrollsService);
    findAll(req: RequestWithUser): Promise<{
        id: string;
        businessId: string;
        userId: string;
        period: string;
        amount: number;
        note: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(req: RequestWithUser, id: string): Promise<{
        id: string;
        businessId: string;
        userId: string;
        period: string;
        amount: number;
        note: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(req: RequestWithUser, dto: CreatePayrollDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        amount: number;
        note: string | null;
        userId: string;
        period: string;
    }>;
    update(req: RequestWithUser, id: string, dto: UpdatePayrollDto): Promise<{
        id: string;
        businessId: string;
        userId: string;
        period: string;
        amount: number;
        note: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(req: RequestWithUser, id: string): Promise<{
        success: boolean;
    }>;
}
