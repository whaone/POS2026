import { PurchasesService } from '../services/purchases.service';
import type { RequestWithUser } from '../../auth/auth.types';
import { CreatePurchaseDto, UpdatePurchaseDto, PurchasePaymentDto, PurchaseReturnDto } from '../dto/purchase.dto';
export declare class PurchasesController {
    private readonly purchasesService;
    constructor(purchasesService: PurchasesService);
    findAll(req: RequestWithUser): Promise<{
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
    findOne(req: RequestWithUser, id: string): Promise<{
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
    create(req: RequestWithUser, dto: CreatePurchaseDto): Promise<{
        id: string;
        businessId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
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
    update(req: RequestWithUser, id: string, dto: UpdatePurchaseDto): Promise<{
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
    remove(req: RequestWithUser, id: string): Promise<{
        success: boolean;
    }>;
    receive(req: RequestWithUser, id: string): Promise<{
        success: boolean;
    }>;
    createPayment(id: string, dto: PurchasePaymentDto): Promise<{
        method: string;
        id: string;
        amount: number;
        accountId: string | null;
        purchaseId: string;
        paidAt: Date;
    }>;
    createReturn(req: RequestWithUser, id: string, dto: PurchaseReturnDto): Promise<{
        id: string;
        businessId: string;
        createdAt: Date;
        reason: string | null;
        amount: number;
        purchaseId: string;
    }>;
}
