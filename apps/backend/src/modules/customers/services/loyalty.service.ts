import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { OnEvent } from '@nestjs/event-emitter';
import {
  loyaltyAccounts,
  loyaltyTransactions,
} from '../../../db/schema/customer.schema';

@Injectable()
export class LoyaltyService {
  // Configurable conversion rate: Rp10,000 = 1 point
  private readonly POINTS_CONVERSION_RATE = 10000;

  constructor(@Inject('DB_CLIENT') private readonly db: NodePgDatabase) {}

  async getBalance(customerId: string) {
    const [account] = await this.db
      .select()
      .from(loyaltyAccounts)
      .where(eq(loyaltyAccounts.customerId, customerId));

    if (!account) {
      return 0;
    }

    return account.pointsBalance;
  }

  // Listen to transaction.completed event from CheckoutService
  @OnEvent('transaction.completed')
  async handleTransactionCompleted(payload: {
    saleId: string;
    businessId: string;
    customerId?: string;
    grandTotal: number;
  }) {
    // Only process if sale has a customer
    if (!payload.customerId) return;

    // Calculate points to earn (integer division)
    const pointsToEarn = Math.floor(
      payload.grandTotal / this.POINTS_CONVERSION_RATE,
    );

    if (pointsToEarn <= 0) return;

    await this.db.transaction(async (tx) => {
      // 1. Check if account exists
      const [account] = await tx
        .select()
        .from(loyaltyAccounts)
        .where(eq(loyaltyAccounts.customerId, payload.customerId!));

      if (!account) {
        // Create account
        await tx.insert(loyaltyAccounts).values({
          customerId: payload.customerId!,
          pointsBalance: pointsToEarn,
        });
      } else {
        // Update account
        await tx
          .update(loyaltyAccounts)
          .set({
            pointsBalance: account.pointsBalance + pointsToEarn,
            updatedAt: new Date(),
          })
          .where(eq(loyaltyAccounts.id, account.id));
      }

      // 2. Record transaction
      await tx.insert(loyaltyTransactions).values({
        customerId: payload.customerId!,
        type: 'earn',
        points: pointsToEarn,
        saleId: payload.saleId,
      });
    });
  }

  async redeemPoints(
    customerId: string,
    pointsToRedeem: number,
    saleId: string,
  ) {
    if (pointsToRedeem <= 0) return;

    await this.db.transaction(async (tx) => {
      const [account] = await tx
        .select()
        .from(loyaltyAccounts)
        .where(eq(loyaltyAccounts.customerId, customerId));

      if (!account || account.pointsBalance < pointsToRedeem) {
        throw new Error('Insufficient points balance');
      }

      // Deduct points
      await tx
        .update(loyaltyAccounts)
        .set({
          pointsBalance: account.pointsBalance - pointsToRedeem,
          updatedAt: new Date(),
        })
        .where(eq(loyaltyAccounts.id, account.id));

      // Record redemption
      await tx.insert(loyaltyTransactions).values({
        customerId,
        type: 'redeem',
        points: pointsToRedeem,
        saleId,
      });
    });
  }
}
