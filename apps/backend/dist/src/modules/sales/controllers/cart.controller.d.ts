import { CartService } from '../services/cart.service';
import { CreateCartDto } from '../dto/create-cart.dto';
import type { JwtPayload } from '../../auth/auth.types';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    createOrUpdateCart(user: JwtPayload, dto: CreateCartDto): Promise<{
        id: string;
        createdAt: Date;
        businessId: string;
        status: string;
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
    getCart(user: JwtPayload, id: string): Promise<{
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
    getReceipt(user: JwtPayload, id: string): Promise<{
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
}
