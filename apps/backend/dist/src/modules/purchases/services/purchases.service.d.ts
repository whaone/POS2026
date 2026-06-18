import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreatePurchaseDto, UpdatePurchaseDto, PurchasePaymentDto, PurchaseReturnDto } from '../dto/purchase.dto';
export declare class PurchasesService {
    private readonly db;
    private eventEmitter;
    constructor(db: NodePgDatabase, eventEmitter: EventEmitter2);
    create(businessId: string, dto: CreatePurchaseDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        status: string;
        locationId: string;
        subtotal: number;
        taxTotal: number;
        shipping: number;
        grandTotal: number;
        paidTotal: number;
        discount: number;
        supplierId: string;
        documentUrl: string | null;
    }>;
    update(businessId: string, purchaseId: string, dto: UpdatePurchaseDto): Promise<{
        id: string;
        businessId: string;
        locationId: string;
        supplierId: string;
        subtotal: number;
        taxTotal: number;
        discount: number;
        shipping: number;
        grandTotal: number;
        paidTotal: number;
        status: string;
        documentUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(businessId: string, purchaseId: string): Promise<{
        success: boolean;
    }>;
    findAll(businessId: string): Promise<{
        id: string;
        businessId: string;
        locationId: string;
        supplierId: string;
        subtotal: number;
        taxTotal: number;
        discount: number;
        shipping: number;
        grandTotal: number;
        paidTotal: number;
        status: string;
        documentUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(businessId: string, id: string): Promise<{
        items: {
            id: string;
            purchaseId: string;
            productId: string;
            variationId: string | null;
            qty: number;
            cost: number;
            tax: number;
            lotNumber: string | null;
            expiryDate: Date | null;
        }[];
        id: string;
        businessId: string;
        locationId: string;
        supplierId: string;
        subtotal: number;
        taxTotal: number;
        discount: number;
        shipping: number;
        grandTotal: number;
        paidTotal: number;
        status: string;
        documentUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    receivePurchase(businessId: string, purchaseId: string): Promise<{
        success: boolean;
    }>;
    createPayment(purchaseId: string, dto: PurchasePaymentDto): Promise<{
        method: string;
        id: string;
        accountId: string | null;
        amount: number;
        purchaseId: string;
        paidAt: Date;
    }>;
    createReturn(businessId: string, purchaseId: string, dto: PurchaseReturnDto): Promise<{
        id: string;
        createdAt: Date;
        businessId: string;
        amount: number;
        reason: string | null;
        purchaseId: string;
    }>;
}
