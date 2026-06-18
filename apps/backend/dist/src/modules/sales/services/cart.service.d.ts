import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateCartDto } from '../dto/create-cart.dto';
export declare class CartService {
    private readonly db;
    constructor(db: NodePgDatabase);
    createOrUpdateCart(businessId: string, locationId: string, cashierId: string, dto: CreateCartDto): Promise<{
        id: string;
        businessId: string;
        status: string;
        createdAt: Date;
        locationId: string;
        customerId: string | null;
        cashierId: string | null;
        commissionAgentId: string | null;
        subtotal: number;
        taxTotal: number;
        discountTotal: number;
        shipping: number;
        grandTotal: number;
        paidTotal: number;
        shiftId: string | null;
        idempotencyKey: string | null;
    }>;
    private createCart;
    private updateCart;
    private calculateTotals;
    getCart(businessId: string, saleId: string): Promise<{
        items: {
            id: string;
            saleId: string;
            productId: string | null;
            variationId: string | null;
            qty: number;
            unitPrice: number;
            discount: number;
            tax: number;
            lineTotal: number;
        }[];
        id: string;
        businessId: string;
        locationId: string;
        customerId: string | null;
        cashierId: string | null;
        commissionAgentId: string | null;
        subtotal: number;
        taxTotal: number;
        discountTotal: number;
        shipping: number;
        grandTotal: number;
        paidTotal: number;
        status: string;
        shiftId: string | null;
        idempotencyKey: string | null;
        createdAt: Date;
    }>;
    getReceipt(businessId: string, saleId: string): Promise<{
        sale: {
            id: string;
            businessId: string;
            locationId: string;
            customerId: string | null;
            cashierId: string | null;
            commissionAgentId: string | null;
            subtotal: number;
            taxTotal: number;
            discountTotal: number;
            shipping: number;
            grandTotal: number;
            paidTotal: number;
            status: string;
            shiftId: string | null;
            idempotencyKey: string | null;
            createdAt: Date;
        };
        items: {
            id: string;
            saleId: string;
            productId: string | null;
            variationId: string | null;
            qty: number;
            unitPrice: number;
            discount: number;
            tax: number;
            lineTotal: number;
        }[];
        payments: {
            id: string;
            saleId: string;
            method: string;
            amount: number;
            accountId: string | null;
            ref: string | null;
        }[];
    }>;
    private resolveItems;
}
