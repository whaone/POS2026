import { ExpensesService } from './expenses.service';
import type { RequestWithUser } from '../auth/auth.types';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
export declare class ExpensesController {
    private readonly expensesService;
    constructor(expensesService: ExpensesService);
    findAll(req: RequestWithUser): Promise<{
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
    findOne(req: RequestWithUser, id: string): Promise<{
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
    create(req: RequestWithUser, dto: CreateExpenseDto): Promise<{
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
    update(req: RequestWithUser, id: string, dto: UpdateExpenseDto): Promise<{
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
    remove(req: RequestWithUser, id: string): Promise<{
        success: boolean;
    }>;
}
