declare enum BookingType {
    TABLE = "table",
    STAFF = "staff",
    SLOT = "slot"
}
declare enum BookingStatus {
    CONFIRMED = "confirmed",
    COLLECTED = "collected",
    CANCELLED = "cancelled"
}
export declare class CreateBookingDto {
    locationId: string;
    customerId: string;
    type: BookingType;
    resourceId?: string;
    startTime: string;
    endTime: string;
    dpAmount?: number;
}
declare const UpdateBookingDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateBookingDto>>;
export declare class UpdateBookingDto extends UpdateBookingDto_base {
    status?: BookingStatus;
}
export declare class BookingDepositDto {
    amount: number;
}
export declare class CreatePreorderItemDto {
    productId: string;
    variationId?: string;
    qty: number;
}
export declare class CreatePreorderDto {
    locationId: string;
    customerId: string;
    source?: string;
    pickupCode?: string;
    items: CreatePreorderItemDto[];
}
export {};
