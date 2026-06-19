import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../core/database/database.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  stock,
  stockTransfers,
  stockTransferItems,
  stockAdjustments,
  stockAdjustmentItems,
} from '../../db/schema/stock.schema';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class StockService {
  constructor(
    @Inject(DATABASE_TOKEN)
    private readonly db: NodePgDatabase,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('transaction.completed')
  async handleTransactionCompleted(payload: {
    businessId: string;
    locationId: string;
    items: { productId: string; variationId?: string; qty: number }[];
  }) {
    for (const item of payload.items) {
      if (item.productId) {
        try {
          await this.deductStock(
            payload.businessId,
            payload.locationId,
            item.productId,
            item.qty,
            item.variationId,
          );
        } catch (error) {
          // In a real production system, this should be logged or queued for dead-letter
          // For now, we try to deduct, but fail silently if stock goes negative,
          // though ideal ACID compliance would have stock check inside the checkout transaction.
          console.error(
            `Failed to deduct stock for product ${item.productId}:`,
            error,
          );
        }
      }
    }
  }

  async getStock(businessId: string, locationId: string) {
    return this.db
      .select()
      .from(stock)
      .where(
        and(eq(stock.businessId, businessId), eq(stock.locationId, locationId)),
      );
  }

  async getStockByProduct(businessId: string, productId: string) {
    return this.db
      .select()
      .from(stock)
      .where(
        and(eq(stock.businessId, businessId), eq(stock.productId, productId)),
      );
  }

  async deductStock(
    businessId: string,
    locationId: string,
    productId: string,
    qty: number,
    variationId?: string,
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      const whereClause = variationId
        ? and(
            eq(stock.businessId, businessId),
            eq(stock.productId, productId),
            eq(stock.variationId, variationId),
            eq(stock.locationId, locationId),
          )
        : and(
            eq(stock.businessId, businessId),
            eq(stock.productId, productId),
            eq(stock.locationId, locationId),
          );

      const [row] = await tx
        .select()
        .from(stock)
        .where(whereClause)
        .for('update')
        .limit(1);

      if (!row) {
        throw new ConflictException('Insufficient stock'); // E-STOCK-409
      }

      const availableQty = row.qty - row.qtyHeld;
      if (availableQty < qty) {
        throw new ConflictException('Insufficient stock'); // E-STOCK-409
      }

      const [updated] = await tx
        .update(stock)
        .set({ qty: sql`${stock.qty} - ${qty}`, updatedAt: new Date() })
        .where(whereClause)
        .returning();

      this.eventEmitter.emit('stock.changed', {
        businessId,
        locationId,
        productId,
        qty: updated.qty,
        qtyHeld: updated.qtyHeld,
      });
    });
  }

  async increaseStock(
    businessId: string,
    locationId: string,
    productId: string,
    qty: number,
    variationId?: string,
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      const whereClause = variationId
        ? and(
            eq(stock.businessId, businessId),
            eq(stock.productId, productId),
            eq(stock.variationId, variationId),
            eq(stock.locationId, locationId),
          )
        : and(
            eq(stock.businessId, businessId),
            eq(stock.productId, productId),
            eq(stock.locationId, locationId),
          );

      const [updated] = await tx
        .update(stock)
        .set({ qty: sql`${stock.qty} + ${qty}`, updatedAt: new Date() })
        .where(whereClause)
        .returning();

      this.eventEmitter.emit('stock.changed', {
        businessId,
        locationId,
        productId,
        qty: updated.qty,
        qtyHeld: updated.qtyHeld,
      });
    });
  }

  async createAdjustment(payload: {
    businessId: string;
    locationId: string;
    type: string;
    reason?: string;
    recoveryAmount?: number;
    createdBy?: string;
    items: { productId: string; qty: number; variationId?: string }[];
  }) {
    return this.db.transaction(async (tx) => {
      const [adjustment] = await tx
        .insert(stockAdjustments)
        .values({
          businessId: payload.businessId,
          locationId: payload.locationId,
          type: payload.type,
          reason: payload.reason,
          recoveryAmount: payload.recoveryAmount || 0,
          createdBy: payload.createdBy,
        })
        .returning();

      for (const item of payload.items) {
        await tx.insert(stockAdjustmentItems).values({
          adjustmentId: adjustment.id,
          productId: item.productId,
          variationId: item.variationId,
          qty: item.qty,
        });

        // Apply adjustment to stock
        const whereClause = item.variationId
          ? and(
              eq(stock.businessId, payload.businessId),
              eq(stock.locationId, payload.locationId),
              eq(stock.productId, item.productId),
              eq(stock.variationId, item.variationId),
            )
          : and(
              eq(stock.businessId, payload.businessId),
              eq(stock.locationId, payload.locationId),
              eq(stock.productId, item.productId),
            );

        const [existingStock] = await tx
          .select()
          .from(stock)
          .where(whereClause)
          .for('update')
          .limit(1);

        if (payload.type === 'increase') {
          if (existingStock) {
            await tx
              .update(stock)
              .set({
                qty: sql`${stock.qty} + ${item.qty}`,
                updatedAt: new Date(),
              })
              .where(whereClause);
          } else {
            await tx.insert(stock).values({
              businessId: payload.businessId,
              locationId: payload.locationId,
              productId: item.productId,
              variationId: item.variationId,
              qty: item.qty,
            });
          }
        } else if (payload.type === 'decrease') {
          if (!existingStock || existingStock.qty < item.qty) {
            throw new ConflictException(
              'Insufficient stock for decrease adjustment',
            );
          }
          await tx
            .update(stock)
            .set({
              qty: sql`${stock.qty} - ${item.qty}`,
              updatedAt: new Date(),
            })
            .where(whereClause);
        }
      }

      this.eventEmitter.emit('stock.adjusted', {
        adjustmentId: adjustment.id,
        businessId: payload.businessId,
      });
      return adjustment;
    });
  }

  async findAllAdjustments(businessId: string, locationId?: string) {
    const whereClause = locationId
      ? and(
          eq(stockAdjustments.businessId, businessId),
          eq(stockAdjustments.locationId, locationId),
        )
      : eq(stockAdjustments.businessId, businessId);

    return this.db
      .select()
      .from(stockAdjustments)
      .where(whereClause)
      .orderBy(sql`${stockAdjustments.createdAt} DESC`);
  }

  async findAdjustment(businessId: string, id: string) {
    const [adjustment] = await this.db
      .select()
      .from(stockAdjustments)
      .where(
        and(
          eq(stockAdjustments.id, id),
          eq(stockAdjustments.businessId, businessId),
        ),
      );

    if (!adjustment) {
      throw new NotFoundException('Adjustment not found');
    }

    const items = await this.db
      .select()
      .from(stockAdjustmentItems)
      .where(eq(stockAdjustmentItems.adjustmentId, id));

    return { ...adjustment, items };
  }

  async transferStock(payload: {
    businessId: string;
    fromLocationId: string;
    toLocationId: string;
    items: { productId: string; qty: number }[];
  }) {
    return this.db.transaction(async (tx) => {
      // Create transfer record
      const [transfer] = await tx
        .insert(stockTransfers)
        .values({
          businessId: payload.businessId,
          fromLocationId: payload.fromLocationId,
          toLocationId: payload.toLocationId,
          status: 'in_transit',
        })
        .returning();

      // For each item: deduct from source, add to transfer_items
      for (const item of payload.items) {
        const [sourceStock] = await tx
          .select()
          .from(stock)
          .where(
            and(
              eq(stock.businessId, payload.businessId),
              eq(stock.locationId, payload.fromLocationId),
              eq(stock.productId, item.productId),
            ),
          )
          .for('update')
          .limit(1);

        if (!sourceStock || sourceStock.qty < item.qty) {
          throw new ConflictException('Insufficient stock for transfer');
        }

        await tx
          .update(stock)
          .set({
            qty: sql`${stock.qty} - ${item.qty}`,
            updatedAt: new Date(),
          })
          .where(eq(stock.id, sourceStock.id));

        await tx.insert(stockTransferItems).values({
          transferId: transfer.id,
          productId: item.productId,
          qty: item.qty,
        });
      }

      this.eventEmitter.emit('stock.transfer.created', {
        transferId: transfer.id,
        businessId: payload.businessId,
        fromLocationId: payload.fromLocationId,
        toLocationId: payload.toLocationId,
      });

      return transfer;
    });
  }

  async completeTransfer(transferId: string) {
    return this.db.transaction(async (tx) => {
      const [transfer] = await tx
        .select()
        .from(stockTransfers)
        .where(eq(stockTransfers.id, transferId));

      if (!transfer || transfer.status !== 'in_transit') {
        throw new NotFoundException('Transfer not found or not in transit');
      }

      const items = await tx
        .select()
        .from(stockTransferItems)
        .where(eq(stockTransferItems.transferId, transferId));

      // Add stock to destination
      for (const item of items) {
        if (!item.productId) continue;

        const [destStock] = await tx
          .select()
          .from(stock)
          .where(
            and(
              eq(stock.businessId, transfer.businessId),
              eq(stock.locationId, transfer.toLocationId),
              eq(stock.productId, item.productId),
            ),
          )
          .for('update')
          .limit(1);

        if (destStock) {
          await tx
            .update(stock)
            .set({
              qty: sql`${stock.qty} + ${item.qty}`,
              updatedAt: new Date(),
            })
            .where(eq(stock.id, destStock.id));
        } else {
          await tx.insert(stock).values({
            businessId: transfer.businessId,
            locationId: transfer.toLocationId,
            productId: item.productId,
            qty: item.qty,
          });
        }
      }

      // Mark transfer completed
      await tx
        .update(stockTransfers)
        .set({ status: 'completed', receivedAt: new Date() })
        .where(eq(stockTransfers.id, transferId));

      this.eventEmitter.emit('stock.transfer.completed', {
        transferId,
        businessId: transfer.businessId,
      });

      return { success: true };
    });
  }
}
