"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_module_1 = require("../../../core/database/database.module");
const booking_schema_1 = require("../../../db/schema/booking.schema");
const event_emitter_1 = require("@nestjs/event-emitter");
let BookingService = class BookingService {
    db;
    eventEmitter;
    constructor(db, eventEmitter) {
        this.db = db;
        this.eventEmitter = eventEmitter;
    }
    async create(businessId, dto) {
        const [booking] = await this.db
            .insert(booking_schema_1.bookings)
            .values({
            businessId,
            locationId: dto.locationId,
            customerId: dto.customerId,
            type: dto.type,
            resourceId: dto.resourceId,
            startTime: new Date(dto.startTime),
            endTime: new Date(dto.endTime),
            dpAmount: dto.dpAmount || 0,
        })
            .returning();
        this.eventEmitter.emit('booking.created', {
            bookingId: booking.id,
            businessId,
            startTime: booking.startTime,
        });
        return booking;
    }
    async findAll(businessId, locationId) {
        const whereClause = locationId
            ? (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(booking_schema_1.bookings.businessId, businessId), (0, drizzle_orm_1.eq)(booking_schema_1.bookings.locationId, locationId))
            : (0, drizzle_orm_1.eq)(booking_schema_1.bookings.businessId, businessId);
        return this.db
            .select()
            .from(booking_schema_1.bookings)
            .where(whereClause)
            .orderBy((0, drizzle_orm_1.sql) `${booking_schema_1.bookings.startTime} DESC`);
    }
    async findOne(businessId, id) {
        const [booking] = await this.db
            .select()
            .from(booking_schema_1.bookings)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(booking_schema_1.bookings.id, id), (0, drizzle_orm_1.eq)(booking_schema_1.bookings.businessId, businessId)));
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        return booking;
    }
    async findByCalendar(businessId, locationId, startDate, endDate) {
        return this.db
            .select()
            .from(booking_schema_1.bookings)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(booking_schema_1.bookings.businessId, businessId), (0, drizzle_orm_1.eq)(booking_schema_1.bookings.locationId, locationId), (0, drizzle_orm_1.gte)(booking_schema_1.bookings.startTime, new Date(startDate)), (0, drizzle_orm_1.lte)(booking_schema_1.bookings.endTime, new Date(endDate))))
            .orderBy((0, drizzle_orm_1.sql) `${booking_schema_1.bookings.startTime} ASC`);
    }
    async update(businessId, id, dto) {
        const existing = await this.findOne(businessId, id);
        if (existing.status === 'cancelled') {
            throw new common_1.BadRequestException('Cannot update cancelled booking');
        }
        const updateData = { updatedAt: new Date() };
        if (dto.locationId)
            updateData.locationId = dto.locationId;
        if (dto.customerId)
            updateData.customerId = dto.customerId;
        if (dto.type)
            updateData.type = dto.type;
        if (dto.resourceId !== undefined)
            updateData.resourceId = dto.resourceId;
        if (dto.startTime)
            updateData.startTime = new Date(dto.startTime);
        if (dto.endTime)
            updateData.endTime = new Date(dto.endTime);
        if (dto.dpAmount !== undefined)
            updateData.dpAmount = dto.dpAmount;
        if (dto.status)
            updateData.status = dto.status;
        const [updated] = await this.db
            .update(booking_schema_1.bookings)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(booking_schema_1.bookings.id, id))
            .returning();
        return updated;
    }
    async remove(businessId, id) {
        const existing = await this.findOne(businessId, id);
        if (existing.status === 'collected') {
            throw new common_1.BadRequestException('Cannot delete collected booking');
        }
        await this.db
            .update(booking_schema_1.bookings)
            .set({ status: 'cancelled', updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(booking_schema_1.bookings.id, id));
        return { success: true };
    }
    async addDeposit(businessId, id, dto) {
        const existing = await this.findOne(businessId, id);
        if (existing.status !== 'confirmed') {
            throw new common_1.BadRequestException('Can only add deposit to confirmed bookings');
        }
        const [updated] = await this.db
            .update(booking_schema_1.bookings)
            .set({
            dpAmount: existing.dpAmount + dto.amount,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(booking_schema_1.bookings.id, id))
            .returning();
        return updated;
    }
};
exports.BookingService = BookingService;
exports.BookingService = BookingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [Function, event_emitter_1.EventEmitter2])
], BookingService);
//# sourceMappingURL=booking.service.js.map