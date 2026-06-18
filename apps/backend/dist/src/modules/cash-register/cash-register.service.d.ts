import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { OpenRegisterDto } from './dto/open-register.dto';
import { CashMovementDto } from './dto/cash-movement.dto';
import { CloseRegisterDto } from './dto/close-register.dto';
export declare class CashRegisterService {
    private readonly db;
    constructor(db: NodePgDatabase);
    openRegister(businessId: string, cashierId: string, dto: OpenRegisterDto): Promise<{
        id: string;
        businessId: string;
        locationId: string;
        openingBalance: number;
        status: string;
        cashierId: string;
        closingCounted: number | null;
        systemCash: number;
        difference: number | null;
        openedAt: Date;
        closedAt: Date | null;
    }>;
    getCurrent(businessId: string, cashierId: string): Promise<{
        id: string;
        businessId: string;
        locationId: string;
        cashierId: string;
        openingBalance: number;
        closingCounted: number | null;
        systemCash: number;
        difference: number | null;
        status: string;
        openedAt: Date;
        closedAt: Date | null;
    }>;
    cashIn(businessId: string, cashierId: string, dto: CashMovementDto): Promise<{
        type: string;
        id: string;
        ref: string | null;
        createdAt: Date;
        amount: number;
        shiftId: string;
    }>;
    cashOut(businessId: string, cashierId: string, dto: CashMovementDto): Promise<{
        type: string;
        id: string;
        ref: string | null;
        createdAt: Date;
        amount: number;
        shiftId: string;
    }>;
    closeRegister(businessId: string, cashierId: string, dto: CloseRegisterDto): Promise<{
        id: string;
        businessId: string;
        locationId: string;
        cashierId: string;
        openingBalance: number;
        closingCounted: number | null;
        systemCash: number;
        difference: number | null;
        status: string;
        openedAt: Date;
        closedAt: Date | null;
    }>;
}
