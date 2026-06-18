import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class StockService {
    private readonly db;
    private readonly eventEmitter;
    constructor(db: NodePgDatabase, eventEmitter: EventEmitter2);
    getStock(businessId: string, locationId: string): Promise<{
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
    getStockByProduct(businessId: string, productId: string): Promise<{
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
    deductStock(businessId: string, locationId: string, productId: string, qty: number, variationId?: string): Promise<void>;
    increaseStock(businessId: string, locationId: string, productId: string, qty: number, variationId?: string): Promise<void>;
    createAdjustment(payload: {
        businessId: string;
        locationId: string;
        type: string;
        reason?: string;
        recoveryAmount?: number;
        createdBy?: string;
        items: {
            productId: string;
            qty: number;
            variationId?: string;
        }[];
    }): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        businessId: string;
        locationId: string;
        reason: string | null;
        recoveryAmount: number;
        createdBy: string | null;
    }>;
    findAllAdjustments(businessId: string, locationId?: string): Promise<{
        id: string;
        businessId: string;
        locationId: string;
        type: string;
        reason: string | null;
        recoveryAmount: number;
        createdBy: string | null;
        createdAt: Date;
    }[]>;
    findAdjustment(businessId: string, id: string): Promise<{
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
    transferStock(payload: {
        businessId: string;
        fromLocationId: string;
        toLocationId: string;
        items: {
            productId: string;
            qty: number;
        }[];
    }): Promise<{
        id: string;
        createdAt: Date;
        businessId: string;
        status: string;
        fromLocationId: string;
        toLocationId: string;
        shippingCharge: number;
        receivedAt: Date | null;
    }>;
    completeTransfer(transferId: string): Promise<{
        success: boolean;
    }>;
}
