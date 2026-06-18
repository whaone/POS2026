import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateBookingDto, UpdateBookingDto, BookingDepositDto, CreatePreorderDto } from '../dto/booking.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class BookingService {
    private readonly db;
    private readonly eventEmitter;
    constructor(db: NodePgDatabase, eventEmitter: EventEmitter2);
    create(businessId: string, dto: CreateBookingDto): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        status: string;
        locationId: string;
        resourceId: string | null;
        customerId: string;
        startTime: Date;
        endTime: Date;
        dpAmount: number;
    }>;
    findAll(businessId: string, locationId?: string): Promise<{
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
    findOne(businessId: string, id: string): Promise<{
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
    findByCalendar(businessId: string, locationId: string, startDate: string, endDate: string): Promise<{
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
    update(businessId: string, id: string, dto: UpdateBookingDto): Promise<{
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
    remove(businessId: string, id: string): Promise<{
        success: boolean;
    }>;
    addDeposit(businessId: string, id: string, dto: BookingDepositDto): Promise<{
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
    createPreorder(businessId: string, dto: CreatePreorderDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        status: string;
        locationId: string;
        customerId: string;
        source: string;
        pickupCode: string | null;
    }>;
    collectPreorder(businessId: string, id: string): Promise<{
        success: boolean;
    }>;
}
