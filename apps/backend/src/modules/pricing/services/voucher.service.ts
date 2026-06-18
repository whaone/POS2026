import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import {
  vouchers,
  voucherRedemptions,
} from '../../../db/schema/pricing.schema';

interface RedeemVoucherPayload {
  voucherCode: string;
  transactionId: string;
  branchId: string;
  cashierId: string;
  amountUsed: number;
}

@Injectable()
export class VoucherService {
  constructor(@Inject('DB_CLIENT') private readonly db: NodePgDatabase) {}

  async validateVoucher(code: string, purchaseAmount: number) {
    const [voucher] = await this.db
      .select()
      .from(vouchers)
      .where(eq(vouchers.code, code));

    if (!voucher) {
      throw new NotFoundException(`Voucher with code ${code} not found`);
    }

    if (voucher.status !== 'active') {
      throw new BadRequestException(`Voucher is not active`);
    }

    if (voucher.expiryDate && new Date() > voucher.expiryDate) {
      throw new BadRequestException(`Voucher has expired`);
    }

    if (purchaseAmount < voucher.minPurchase) {
      throw new BadRequestException(
        `Minimum purchase amount is ${voucher.minPurchase}`,
      );
    }

    return voucher;
  }

  async redeemVoucher(payload: RedeemVoucherPayload) {
    const voucher = await this.validateVoucher(
      payload.voucherCode,
      payload.amountUsed,
    );

    try {
      return await this.db.transaction(async (tx) => {
        return this.redeemVoucherInTx(tx, voucher.id, payload);
      });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message &&
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        throw new ConflictException(
          'Voucher has already been redeemed (E-VOUCHER-409)',
        );
      }
      throw error;
    }
  }

  async redeemVoucherInTx(
    tx: NodePgDatabase,
    voucherId: string,
    payload: Omit<RedeemVoucherPayload, 'voucherCode'>,
  ) {
    const [redemption] = await tx
      .insert(voucherRedemptions)
      .values({
        voucherId,
        transactionId: payload.transactionId,
        branchId: payload.branchId,
        cashierId: payload.cashierId,
        amountUsed: payload.amountUsed,
      })
      .returning();

    await tx
      .update(vouchers)
      .set({ status: 'redeemed' })
      .where(eq(vouchers.id, voucherId));

    return redemption;
  }
}
