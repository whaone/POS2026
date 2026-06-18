import { CashRegisterService } from './cash-register.service';
import { OpenRegisterDto } from './dto/open-register.dto';
import { CashMovementDto } from './dto/cash-movement.dto';
import { CloseRegisterDto } from './dto/close-register.dto';
import type { JwtPayload } from '../auth/auth.types';
export declare class CashRegisterController {
    private readonly cashRegisterService;
    constructor(cashRegisterService: CashRegisterService);
    openRegister(user: JwtPayload, dto: OpenRegisterDto): Promise<{
        id: string;
        businessId: string;
        status: string;
        locationId: string;
        cashierId: string;
        openingBalance: number;
        closingCounted: number | null;
        systemCash: number;
        difference: number | null;
        openedAt: Date;
        closedAt: Date | null;
    }>;
    getCurrent(user: JwtPayload): Promise<{
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
    cashIn(user: JwtPayload, dto: CashMovementDto): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        ref: string | null;
        shiftId: string;
        amount: number;
    }>;
    cashOut(user: JwtPayload, dto: CashMovementDto): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        ref: string | null;
        shiftId: string;
        amount: number;
    }>;
    closeRegister(user: JwtPayload, dto: CloseRegisterDto): Promise<{
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
