import { AccountingService } from '../services/accounting.service';
import type { RequestWithUser } from '../../auth/auth.types';
export declare class AccountingReportsController {
    private readonly accountingService;
    constructor(accountingService: AccountingService);
    getBalanceSheet(req: RequestWithUser): Promise<{
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
    getTrialBalance(req: RequestWithUser): Promise<{
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
    getCashFlow(req: RequestWithUser, startDate?: string, endDate?: string): {
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
