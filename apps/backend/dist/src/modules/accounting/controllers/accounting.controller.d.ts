import { AccountingService } from '../services/accounting.service';
import type { RequestWithUser } from '../../auth/auth.types';
import { CreateAccountDto, UpdateAccountDto } from '../dto/accounting.dto';
export declare class AccountingController {
    private readonly accountingService;
    constructor(accountingService: AccountingService);
    findAll(req: RequestWithUser): Promise<{
        id: string;
        businessId: string;
        name: string;
        type: string;
        openingBalance: number;
        balance: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(req: RequestWithUser, id: string): Promise<{
        id: string;
        businessId: string;
        name: string;
        type: string;
        openingBalance: number;
        balance: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(req: RequestWithUser, dto: CreateAccountDto): Promise<{
        name: string;
        type: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        openingBalance: number;
        balance: number;
    }>;
    update(req: RequestWithUser, id: string, dto: UpdateAccountDto): Promise<{
        id: string;
        businessId: string;
        name: string;
        type: string;
        openingBalance: number;
        balance: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(req: RequestWithUser, id: string): Promise<{
        success: boolean;
    }>;
}
