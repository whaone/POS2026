import { StockService } from './stock.service';
import type { RequestWithUser } from '../auth/auth.types';
import { StockAdjustmentDto, StockTransferDto } from './dto/stock.dto';
export declare class StockController {
    private readonly stockService;
    constructor(stockService: StockService);
    getStock(req: RequestWithUser, locationId: string): Promise<{
        id: string;
        businessId: string;
        locationId: string;
        productId: string | null;
        variationId: string | null;
        qty: number;
        qtyHeld: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findAllAdjustments(req: RequestWithUser, locationId?: string): Promise<{
        id: string;
        businessId: string;
        locationId: string;
        type: string;
        reason: string | null;
        recoveryAmount: number;
        createdBy: string | null;
        createdAt: Date;
    }[]>;
    findAdjustment(req: RequestWithUser, id: string): Promise<{
        items: {
            id: string;
            adjustmentId: string;
            productId: string | null;
            variationId: string | null;
            qty: number;
        }[];
        id: string;
        businessId: string;
        locationId: string;
        type: string;
        reason: string | null;
        recoveryAmount: number;
        createdBy: string | null;
        createdAt: Date;
    }>;
    createAdjustment(req: RequestWithUser, dto: StockAdjustmentDto): Promise<{
        type: string;
        id: string;
        businessId: string;
        createdAt: Date;
        reason: string | null;
        locationId: string;
        recoveryAmount: number;
        createdBy: string | null;
    }>;
    createTransfer(req: RequestWithUser, dto: StockTransferDto): Promise<{
        id: string;
        businessId: string;
        status: string;
        createdAt: Date;
        fromLocationId: string;
        toLocationId: string;
        shippingCharge: number;
        receivedAt: Date | null;
    }>;
    completeTransfer(id: string): Promise<{
        success: boolean;
    }>;
}
