import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateAccountDto, UpdateAccountDto } from '../dto/accounting.dto';
export declare class AccountingService {
    private readonly db;
    constructor(db: NodePgDatabase);
    createAccount(businessId: string, dto: CreateAccountDto): Promise<{
        name: string;
        type: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
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
    getAccountReport(businessId: string, id: string, startDate?: Date, endDate?: Date): Promise<{
        account: {
            id: string;
            businessId: string;
            name: string;
            type: string;
            openingBalance: number;
            balance: number;
            createdAt: Date;
            updatedAt: Date;
        };
        mutations: {
            id: string;
            debit: number;
            credit: number;
            date: Date;
            memo: string | null;
            refType: string | null;
        }[];
    }>;
    getTrialBalance(businessId: string): Promise<{
        items: {
            debit: number;
            credit: number;
            id: string;
            businessId: string;
            name: string;
            type: string;
            openingBalance: number;
            balance: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
        totalDebit: number;
        totalCredit: number;
        isBalanced: boolean;
    }>;
    getBalanceSheet(businessId: string): Promise<{
        assets: {
            items: {
                id: string;
                businessId: string;
                name: string;
                type: string;
                openingBalance: number;
                balance: number;
                createdAt: Date;
                updatedAt: Date;
            }[];
            total: number;
        };
        liabilities: {
            items: {
                id: string;
                businessId: string;
                name: string;
                type: string;
                openingBalance: number;
                balance: number;
                createdAt: Date;
                updatedAt: Date;
            }[];
            total: number;
        };
        equity: {
            items: {
                id: string;
                businessId: string;
                name: string;
                type: string;
                openingBalance: number;
                balance: number;
                createdAt: Date;
                updatedAt: Date;
            }[];
            total: number;
        };
    }>;
    getCashFlow(businessId: string, startDate?: Date, endDate?: Date): {
        message: string;
        period: {
            start: Date | undefined;
            end: Date | undefined;
        };
        operatingActivities: {
            inflow: number;
            outflow: number;
            net: number;
        };
        investingActivities: {
            inflow: number;
            outflow: number;
            net: number;
        };
        financingActivities: {
            inflow: number;
            outflow: number;
            net: number;
        };
        netIncreaseInCash: number;
    };
}
