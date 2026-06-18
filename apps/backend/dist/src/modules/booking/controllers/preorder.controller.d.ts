import { BookingService } from '../services/booking.service';
import type { RequestWithUser } from '../../auth/auth.types';
import { CreatePreorderDto } from '../dto/booking.dto';
export declare class PreorderController {
    private readonly bookingService;
    constructor(bookingService: BookingService);
    createPreorder(req: RequestWithUser, dto: CreatePreorderDto): Promise<{
        id: string;
        businessId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        locationId: string;
        customerId: string;
        source: string;
        pickupCode: string | null;
    }>;
    collectPreorder(req: RequestWithUser, id: string): Promise<{
        success: boolean;
    }>;
}
