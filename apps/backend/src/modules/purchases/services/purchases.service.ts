import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  purchases,
  purchaseItems,
  purchasePayments,
  purchaseReturns,
  purchaseReturnItems,
} from '../../../db/schema/purchase.schema';
import { stock } from '../../../db/schema/stock.schema';
import { contactLedgers } from '../../../db/schema/contact.schema';
import {
  CreatePurchaseDto,
  UpdatePurchaseDto,
  PurchasePaymentDto,
  PurchaseReturnDto,
} from '../dto/purchase.dto';

@Injectable()
export class PurchasesService {
  constructor(
    @Inject('DB_CLIENT') private readonly db: NodePgDatabase,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(businessId: string, dto: CreatePurchaseDto) {
    const [purchase] = await this.db
      .insert(purchases)
      .values({
        businessId,
        locationId: dto.locationId,
        supplierId: dto.supplierId,
        subtotal: dto.subtotal,
        taxTotal: dto.taxTotal,
        discount: dto.discount,
        shipping: dto.shipping,
        grandTotal: dto.grandTotal,
        status: 'credit',
      })
      .returning();

    if (dto.items && dto.items.length > 0) {
      await this.db.insert(purchaseItems).values(
        dto.items.map((item) => ({
          purchaseId: purchase.id,
          productId: item.productId,
          variationId: item.variationId,
          qty: item.qty,
          cost: item.cost,
          tax: item.tax,
          lotNumber: item.lotNumber,
          expiryDate: item.expiryDate,
        })),
      );
    }

    return purchase;
  }

  async update(businessId: string, purchaseId: string, dto: UpdatePurchaseDto) {
    const [purchase] = await this.db
      .select()
      .from(purchases)
      .where(
        and(eq(purchases.id, purchaseId), eq(purchases.businessId, businessId)),
      );

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    if (purchase.status !== 'credit') {
      throw new BadRequestException(
        'Cannot update purchase that is not in credit status',
      );
    }

    const [updated] = await this.db
      .update(purchases)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(purchases.id, purchaseId))
      .returning();

    if (dto.items) {
      await this.db
        .delete(purchaseItems)
        .where(eq(purchaseItems.purchaseId, purchaseId));

      if (dto.items.length > 0) {
        await this.db.insert(purchaseItems).values(
          dto.items.map((item) => ({
            purchaseId,
            productId: item.productId,
            variationId: item.variationId,
            qty: item.qty,
            cost: item.cost,
            tax: item.tax,
            lotNumber: item.lotNumber,
            expiryDate: item.expiryDate,
          })),
        );
      }
    }

    return updated;
  }

  async remove(businessId: string, purchaseId: string) {
    const [purchase] = await this.db
      .select()
      .from(purchases)
      .where(
        and(eq(purchases.id, purchaseId), eq(purchases.businessId, businessId)),
      );

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    if (purchase.status !== 'credit') {
      throw new BadRequestException(
        'Cannot delete purchase that is not in credit status',
      );
    }

    await this.db.delete(purchases).where(eq(purchases.id, purchaseId));

    return { success: true };
  }

  async findAll(businessId: string) {
    return this.db
      .select()
      .from(purchases)
      .where(eq(purchases.businessId, businessId));
  }

  async findOne(businessId: string, id: string) {
    const [purchase] = await this.db
      .select()
      .from(purchases)
      .where(and(eq(purchases.id, id), eq(purchases.businessId, businessId)));

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    const items = await this.db
      .select()
      .from(purchaseItems)
      .where(eq(purchaseItems.purchaseId, id));

    return { ...purchase, items };
  }

  async receivePurchase(businessId: string, purchaseId: string) {
    const [purchase] = await this.db
      .select()
      .from(purchases)
      .where(
        and(eq(purchases.id, purchaseId), eq(purchases.businessId, businessId)),
      );

    if (!purchase) {
      throw new NotFoundException(`Purchase not found`);
    }

    if (purchase.status === 'received' || purchase.status === 'paid') {
      throw new BadRequestException(`Purchase already processed`);
    }

    const items = await this.db
      .select()
      .from(purchaseItems)
      .where(eq(purchaseItems.purchaseId, purchaseId));

    await this.db.transaction(async (tx) => {
      // 1. Update purchase status
      await tx
        .update(purchases)
        .set({ status: 'received', updatedAt: new Date() })
        .where(eq(purchases.id, purchaseId));

      // 2. Add to contact ledger (hutang)
      await tx.insert(contactLedgers).values({
        contactId: purchase.supplierId,
        refType: 'purchase',
        refId: purchaseId,
        credit: purchase.grandTotal, // We owe them this much
        debit: 0,
        balance: purchase.grandTotal, // Actual running balance needs to be calculated in real prod
      });

      // 3. Update stock (increase)
      for (const item of items) {
        // Find existing stock
        const [existingStock] = await tx
          .select()
          .from(stock)
          .where(
            and(
              eq(stock.businessId, businessId),
              eq(stock.locationId, purchase.locationId),
              eq(stock.productId, item.productId),
              item.variationId
                ? eq(stock.variationId, item.variationId)
                : undefined,
            ),
          );

        if (existingStock) {
          await tx
            .update(stock)
            .set({
              qty: existingStock.qty + item.qty,
              updatedAt: new Date(),
            })
            .where(eq(stock.id, existingStock.id));
        } else {
          await tx.insert(stock).values({
            businessId,
            locationId: purchase.locationId,
            productId: item.productId,
            variationId: item.variationId,
            qty: item.qty,
          });
        }
      }
    });

    // 4. Emit event for async tasks (like notifications, reporting)
    this.eventEmitter.emit('purchase.received', {
      purchaseId,
      businessId,
      grandTotal: purchase.grandTotal,
    });

    return { success: true };
  }

  async createPayment(purchaseId: string, dto: PurchasePaymentDto) {
    return this.db.transaction(async (tx) => {
      const [purchase] = await tx
        .select()
        .from(purchases)
        .where(eq(purchases.id, purchaseId))
        .for('update');

      if (!purchase) {
        throw new NotFoundException('Purchase not found');
      }

      const [payment] = await tx
        .insert(purchasePayments)
        .values({
          purchaseId,
          method: dto.method,
          amount: dto.amount,
          accountId: dto.accountId,
        })
        .returning();

      const newPaidTotal = purchase.paidTotal + dto.amount;
      await tx
        .update(purchases)
        .set({
          paidTotal: newPaidTotal,
          status: newPaidTotal >= purchase.grandTotal ? 'paid' : 'partial',
        })
        .where(eq(purchases.id, purchaseId));

      await tx.insert(contactLedgers).values({
        contactId: purchase.supplierId,
        refType: 'payment',
        refId: payment.id,
        debit: dto.amount,
        credit: 0,
        balance: 0,
      });

      this.eventEmitter.emit('payment.recorded', {
        type: 'purchase',
        paymentId: payment.id,
        amount: dto.amount,
        accountId: dto.accountId,
      });

      return payment;
    });
  }

  async createReturn(
    businessId: string,
    purchaseId: string,
    dto: PurchaseReturnDto,
  ) {
    return this.db.transaction(async (tx) => {
      const [purchase] = await tx
        .select()
        .from(purchases)
        .where(
          and(
            eq(purchases.id, purchaseId),
            eq(purchases.businessId, businessId),
          ),
        );

      if (!purchase) {
        throw new NotFoundException('Purchase not found');
      }

      const [returnRecord] = await tx
        .insert(purchaseReturns)
        .values({
          purchaseId,
          businessId,
          reason: dto.reason,
          amount: dto.amount,
        })
        .returning();

      if (dto.items && dto.items.length > 0) {
        await tx.insert(purchaseReturnItems).values(
          dto.items.map((item) => ({
            returnId: returnRecord.id,
            purchaseItemId: item.purchaseItemId,
            qty: item.qty,
          })),
        );

        // Deduct stock
        for (const item of dto.items) {
          const [existingStock] = await tx
            .select()
            .from(stock)
            .where(
              and(
                eq(stock.businessId, businessId),
                eq(stock.locationId, purchase.locationId),
                eq(stock.productId, item.productId),
              ),
            )
            .for('update')
            .limit(1);

          if (existingStock && existingStock.qty >= item.qty) {
            await tx
              .update(stock)
              .set({
                qty: existingStock.qty - item.qty,
                updatedAt: new Date(),
              })
              .where(eq(stock.id, existingStock.id));
          }
        }
      }

      // Add to contact ledger (decrease hutang)
      if (
        purchase.status === 'received' ||
        purchase.status === 'paid' ||
        purchase.status === 'partial'
      ) {
        await tx.insert(contactLedgers).values({
          contactId: purchase.supplierId,
          refType: 'purchase', // Using purchase as refType since we don't have purchase_return in schema? Wait, we can use 'purchase' and refId as returnId. Wait, schema says ref_type[sale|purchase|payment]. So we can use 'purchase'.
          refId: purchaseId, // Let's use purchaseId so it links back to original purchase.
          debit: dto.amount, // We reduce what we owe them
          credit: 0,
          balance: 0, // In prod, we calc actual balance
        });
      }

      return returnRecord;
    });
  }
}
