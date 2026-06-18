import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../../core/database/database.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  bookings,
  preorders,
  preorderItems,
} from '../../../db/schema/booking.schema';
import { stock } from '../../../db/schema/stock.schema';
import {
  CreateBookingDto,
  UpdateBookingDto,
  BookingDepositDto,
  CreatePreorderDto,
} from '../dto/booking.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class BookingService {
  constructor(
    @Inject(DATABASE_TOKEN)
    private readonly db: NodePgDatabase,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(businessId: string, dto: CreateBookingDto) {
    const [booking] = await this.db
      .insert(bookings)
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

  async findAll(businessId: string, locationId?: string) {
    const whereClause = locationId
      ? and(
          eq(bookings.businessId, businessId),
          eq(bookings.locationId, locationId),
        )
      : eq(bookings.businessId, businessId);

    return this.db
      .select()
      .from(bookings)
      .where(whereClause)
      .orderBy(sql`${bookings.startTime} DESC`);
  }

  async findOne(businessId: string, id: string) {
    const [booking] = await this.db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, id), eq(bookings.businessId, businessId)));

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async findByCalendar(
    businessId: string,
    locationId: string,
    startDate: string,
    endDate: string,
  ) {
    return this.db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.businessId, businessId),
          eq(bookings.locationId, locationId),
          gte(bookings.startTime, new Date(startDate)),
          lte(bookings.endTime, new Date(endDate)),
        ),
      )
      .orderBy(sql`${bookings.startTime} ASC`);
  }

  async update(businessId: string, id: string, dto: UpdateBookingDto) {
    const existing = await this.findOne(businessId, id);

    if (existing.status === 'cancelled') {
      throw new BadRequestException('Cannot update cancelled booking');
    }

    const updateData: Record<string, any> = { updatedAt: new Date() };

    if (dto.locationId) updateData.locationId = dto.locationId;
    if (dto.customerId) updateData.customerId = dto.customerId;
    if (dto.type) updateData.type = dto.type;
    if (dto.resourceId !== undefined) updateData.resourceId = dto.resourceId;
    if (dto.startTime) updateData.startTime = new Date(dto.startTime);
    if (dto.endTime) updateData.endTime = new Date(dto.endTime);
    if (dto.dpAmount !== undefined) updateData.dpAmount = dto.dpAmount;
    if (dto.status) updateData.status = dto.status;

    const [updated] = await this.db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, id))
      .returning();

    return updated;
  }

  async remove(businessId: string, id: string) {
    const existing = await this.findOne(businessId, id);

    if (existing.status === 'collected') {
      throw new BadRequestException('Cannot delete collected booking');
    }

    await this.db
      .update(bookings)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(bookings.id, id));

    return { success: true };
  }

  async addDeposit(businessId: string, id: string, dto: BookingDepositDto) {
    const existing = await this.findOne(businessId, id);

    if (existing.status !== 'confirmed') {
      throw new BadRequestException(
        'Can only add deposit to confirmed bookings',
      );
    }

    const [updated] = await this.db
      .update(bookings)
      .set({
        dpAmount: existing.dpAmount + dto.amount,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id))
      .returning();

    return updated;
  }

  // Preorders
  async createPreorder(businessId: string, dto: CreatePreorderDto) {
    return this.db.transaction(async (tx) => {
      const [preorder] = await tx
        .insert(preorders)
        .values({
          businessId,
          locationId: dto.locationId,
          customerId: dto.customerId,
          source: dto.source || 'pos',
          pickupCode: dto.pickupCode,
        })
        .returning();

      if (dto.items && dto.items.length > 0) {
        await tx.insert(preorderItems).values(
          dto.items.map((item) => ({
            preorderId: preorder.id,
            productId: item.productId,
            variationId: item.variationId,
            qty: item.qty,
          })),
        );

        // Hold stock
        for (const item of dto.items) {
          const whereClause = item.variationId
            ? and(
                eq(stock.businessId, businessId),
                eq(stock.locationId, dto.locationId),
                eq(stock.productId, item.productId),
                eq(stock.variationId, item.variationId),
              )
            : and(
                eq(stock.businessId, businessId),
                eq(stock.locationId, dto.locationId),
                eq(stock.productId, item.productId),
              );

          const [existingStock] = await tx
            .select()
            .from(stock)
            .where(whereClause)
            .for('update')
            .limit(1);

          if (existingStock) {
            await tx
              .update(stock)
              .set({
                qtyHeld: existingStock.qtyHeld + item.qty,
                updatedAt: new Date(),
              })
              .where(eq(stock.id, existingStock.id));
          } else {
            await tx.insert(stock).values({
              businessId,
              locationId: dto.locationId,
              productId: item.productId,
              variationId: item.variationId,
              qty: 0,
              qtyHeld: item.qty,
            });
          }
        }
      }

      this.eventEmitter.emit('preorder.created', {
        preorderId: preorder.id,
        businessId,
      });

      return preorder;
    });
  }

  async collectPreorder(businessId: string, id: string) {
    return this.db.transaction(async (tx) => {
      const [preorder] = await tx
        .select()
        .from(preorders)
        .where(and(eq(preorders.id, id), eq(preorders.businessId, businessId)));

      if (!preorder) throw new NotFoundException('Preorder not found');
      if (preorder.status !== 'reserved') {
        throw new BadRequestException('Preorder already processed');
      }

      const items = await tx
        .select()
        .from(preorderItems)
        .where(eq(preorderItems.preorderId, id));

      await tx
        .update(preorders)
        .set({ status: 'collected', updatedAt: new Date() })
        .where(eq(preorders.id, id));

      // Release hold and deduct qty (since it is collected)
      for (const item of items) {
        const whereClause = item.variationId
          ? and(
              eq(stock.businessId, businessId),
              eq(stock.locationId, preorder.locationId),
              eq(stock.productId, item.productId),
              eq(stock.variationId, item.variationId),
            )
          : and(
              eq(stock.businessId, businessId),
              eq(stock.locationId, preorder.locationId),
              eq(stock.productId, item.productId),
            );

        const [existingStock] = await tx
          .select()
          .from(stock)
          .where(whereClause)
          .for('update')
          .limit(1);

        if (existingStock) {
          await tx
            .update(stock)
            .set({
              qty: existingStock.qty - item.qty,
              qtyHeld: existingStock.qtyHeld - item.qty,
              updatedAt: new Date(),
            })
            .where(eq(stock.id, existingStock.id));
        }
      }

      return { success: true };
    });
  }
}
