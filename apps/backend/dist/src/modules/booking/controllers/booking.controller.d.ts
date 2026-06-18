import { BookingService } from '../services/booking.service';
import type { RequestWithUser } from '../../auth/auth.types';
import { CreateBookingDto, UpdateBookingDto, BookingDepositDto } from '../dto/booking.dto';
export declare class BookingController {
    private readonly bookingService;
    constructor(bookingService: BookingService);
    findAll(req: RequestWithUser, locationId?: string): Promise<{
        id: string;
        businessId: string;
        locationId: string;
        customerId: string;
        type: string;
        resourceId: string | null;
        startTime: Date;
        endTime: Date;
        status: string;
        dpAmount: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findByCalendar(req: RequestWithUser, locationId: string, startDate: string, endDate: string): Promise<{
        id: string;
        businessId: string;
        locationId: string;
        customerId: string;
        type: string;
        resourceId: string | null;
        startTime: Date;
        endTime: Date;
        status: string;
        dpAmount: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(req: RequestWithUser, id: string): Promise<{
        id: string;
        businessId: string;
        locationId: string;
        customerId: string;
        type: string;
        resourceId: string | null;
        startTime: Date;
        endTime: Date;
        status: string;
        dpAmount: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(req: RequestWithUser, dto: CreateBookingDto): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        locationId: string;
        status: string;
        resourceId: string | null;
        customerId: string;
        startTime: Date;
        endTime: Date;
        dpAmount: number;
    }>;
    update(req: RequestWithUser, id: string, dto: UpdateBookingDto): Promise<{
        id: string;
        businessId: string;
        locationId: string;
        customerId: string;
        type: string;
        resourceId: string | null;
        startTime: Date;
        endTime: Date;
        status: string;
        dpAmount: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(req: RequestWithUser, id: string): Promise<{
        success: boolean;
    }>;
    addDeposit(req: RequestWithUser, id: string, dto: BookingDepositDto): Promise<{
        id: string;
        businessId: string;
        locationId: string;
        customerId: string;
        type: string;
        resourceId: string | null;
        startTime: Date;
        endTime: Date;
        status: string;
        dpAmount: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
