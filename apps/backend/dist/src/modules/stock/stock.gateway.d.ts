import { Server } from 'socket.io';
import { StockService } from './stock.service';
export declare class StockGateway {
    private readonly stockService;
    server: Server;
    constructor(stockService: StockService);
    handleStockCheck(data: {
        businessId: string;
        productId: string;
    }): Promise<{
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
    handleStockChangedEvent(payload: {
        businessId: string;
        locationId: string;
        productId: string;
        qty: number;
        qtyHeld: number;
    }): void;
}
