import {
  Injectable,
  Inject,
  NotFoundException,
  UnprocessableEntityException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DATABASE_TOKEN } from '../../../core/database/database.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sales, salePayments } from '../../../db/schema/sales.schema';
import { CheckoutPayDto, PaymentMethod } from '../dto/checkout.dto';
import { VoucherService } from '../../pricing/services/voucher.service';

@Injectable()
export class CheckoutService {
  constructor(
    @Inject(DATABASE_TOKEN)
    private readonly db: NodePgDatabase,
    private readonly eventEmitter: EventEmitter2,
    private readonly voucherService: VoucherService,
  ) {}

  async processPayment(businessId: string, dto: CheckoutPayDto) {
    // Idempotency check: if sale already has this key and is paid, return existing
    const [existingByKey] = await this.db
      .select()
      .from(sales)
      .where(
        and(
          eq(sales.idempotencyKey, dto.idempotencyKey),
          eq(sales.businessId, businessId),
        ),
      )
      .limit(1);

    if (existingByKey && existingByKey.status === 'paid') {
      return existingByKey; // Idempotent: return existing result
    }

    return this.db.transaction(async (tx) => {
      // 1. Lock the sale record to prevent concurrent checkouts
      const [sale] = await tx
        .select()
        .from(sales)
        .where(and(eq(sales.id, dto.saleId), eq(sales.businessId, businessId)))
        .for('update')
        .limit(1);

      if (!sale) {
        throw new NotFoundException(`Sale ${dto.saleId} not found`);
      }

      if (sale.status === 'paid') {
        throw new UnprocessableEntityException('Sale is already paid');
      }

      // 2. Calculate total payment
      const totalPayment = dto.payments.reduce((sum, p) => sum + p.amount, 0);

      // F1-SAL-06: Tolak bayar < tagihan (non-kredit) -> mapped to E-PAY-422
      if (totalPayment < sale.grandTotal) {
        throw new UnprocessableEntityException({
          message: 'Payment amount is less than grand total',
          code: 'E-PAY-422',
        });
      }

      // 3. Handle voucher payments (F2-VCH-02: integrate voucher with split payment)
      for (const payment of dto.payments) {
        if (payment.method === PaymentMethod.VOUCHER) {
          if (!payment.voucherCode) {
            throw new BadRequestException(
              'voucherCode is required for voucher payment',
            );
          }
          const voucher = await this.voucherService.validateVoucher(
            payment.voucherCode,
            sale.grandTotal,
          );
          await this.voucherService.redeemVoucherInTx(tx, voucher.id, {
            transactionId: sale.id,
            branchId: sale.locationId,
            cashierId: sale.cashierId || '',
            amountUsed: payment.amount,
          });
        }
      }

      // 4. Insert payments
      const paymentInserts = dto.payments.map((p) => ({
        saleId: sale.id,
        method: p.method,
        amount: p.amount,
        accountId: p.accountId,
        ref: p.ref,
      }));
      await tx.insert(salePayments).values(paymentInserts);

      // 5. Update sale status, paidTotal, and idempotencyKey
      const [updatedSale] = await tx
        .update(sales)
        .set({
          paidTotal: totalPayment,
          status: 'paid',
          idempotencyKey: dto.idempotencyKey,
        })
        .where(eq(sales.id, sale.id))
        .returning();

      // 6. Emit TransactionCompleted event after transaction succeeds
      this.eventEmitter.emit('TransactionCompleted', {
        saleId: updatedSale.id,
        businessId: updatedSale.businessId,
        locationId: updatedSale.locationId,
        customerId: updatedSale.customerId,
        cashierId: updatedSale.cashierId,
        grandTotal: updatedSale.grandTotal,
        paidTotal: updatedSale.paidTotal,
      });

      return updatedSale;
    });
  }
}
