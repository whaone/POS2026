import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateAccountDto, UpdateAccountDto } from '../dto/accounting.dto';
export declare class AccountingService {
    private readonly db;
    constructor(db: NodePgDatabase);
    createAccount(businessId: string, dto: CreateAccountDto): Promise<{
        name: string;
        type: string;
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        openingBalance: number;
        balance: number;
    }>;
    findAllAccounts(businessId: string): Promise<{
        id: string;
        businessId: string;
        name: string;
        type: string;
        openingBalance: number;
        balance: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findAccount(businessId: string, id: string): Promise<{
        id: string;
        businessId: string;
        name: string;
        type: string;
        openingBalance: number;
        balance: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateAccount(businessId: string, id: string, dto: UpdateAccountDto): Promise<{
        id: string;
        businessId: string;
        name: string;
        type: string;
        openingBalance: number;
        balance: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteAccount(businessId: string, id: string): Promise<{
        success: boolean;
    }>;
}
