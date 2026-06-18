import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../../core/database/database.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { transactionTabs, heldCarts } from '../../../db/schema/sales.schema';
import { UpdateTabDto } from '../dto/update-tab.dto';

const MAX_TABS = 10;

@Injectable()
export class TabService {
  constructor(
    @Inject(DATABASE_TOKEN)
    private readonly db: NodePgDatabase,
  ) {}

  async listTabs(businessId: string, shiftId?: string) {
    const whereClause = shiftId
      ? and(
          eq(transactionTabs.businessId, businessId),
          eq(transactionTabs.shiftId, shiftId),
        )
      : eq(transactionTabs.businessId, businessId);

    return this.db.select().from(transactionTabs).where(whereClause);
  }

  async openTab(
    businessId: string,
    locationId: string,
    cashierId: string,
    shiftId?: string,
  ) {
    // Count active tabs for this shift
    const countWhere = shiftId
      ? and(
          eq(transactionTabs.businessId, businessId),
          eq(transactionTabs.shiftId, shiftId),
          eq(transactionTabs.status, 'active'),
        )
      : and(
          eq(transactionTabs.businessId, businessId),
          eq(transactionTabs.status, 'active'),
        );

    const [countResult] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(transactionTabs)
      .where(countWhere);

    if (countResult && countResult.count >= MAX_TABS) {
      throw new ConflictException({
        message: `Maximum ${MAX_TABS} tabs allowed per session`,
        code: 'E-TAB-409',
      });
    }

    // Find next available tab index
    const existing = await this.db
      .select({ tabIndex: transactionTabs.tabIndex })
      .from(transactionTabs)
      .where(countWhere);

    const usedIndices = new Set(existing.map((r) => r.tabIndex));
    let nextIndex = 1;
    while (usedIndices.has(nextIndex) && nextIndex <= MAX_TABS) {
      nextIndex++;
    }

    const [newTab] = await this.db
      .insert(transactionTabs)
      .values({
        businessId,
        locationId,
        shiftId,
        cashierId,
        tabIndex: nextIndex,
        label: `Tab ${nextIndex}`,
        status: 'active',
        itemCount: 0,
        subtotalAmount: 0,
      })
      .returning();

    return newTab;
  }

  async getTab(businessId: string, tabId: string) {
    const [tab] = await this.db
      .select()
      .from(transactionTabs)
      .where(
        and(
          eq(transactionTabs.id, tabId),
          eq(transactionTabs.businessId, businessId),
        ),
      )
      .limit(1);

    if (!tab) {
      throw new NotFoundException(`Tab ${tabId} not found`);
    }

    return tab;
  }

  async updateTab(businessId: string, tabId: string, dto: UpdateTabDto) {
    await this.getTab(businessId, tabId); // verify exists

    const [updated] = await this.db
      .update(transactionTabs)
      .set({ ...dto, updatedAt: new Date() })
      .where(
        and(
          eq(transactionTabs.id, tabId),
          eq(transactionTabs.businessId, businessId),
        ),
      )
      .returning();

    return updated;
  }

  async holdTab(businessId: string, tabId: string) {
    await this.getTab(businessId, tabId); // verify exists

    const [held] = await this.db
      .update(transactionTabs)
      .set({
        status: 'on_hold',
        heldAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(transactionTabs.id, tabId),
          eq(transactionTabs.businessId, businessId),
        ),
      )
      .returning();

    return held;
  }

  async resumeTab(businessId: string, tabId: string) {
    await this.getTab(businessId, tabId); // verify exists

    const [resumed] = await this.db
      .update(transactionTabs)
      .set({
        status: 'active',
        heldAt: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(transactionTabs.id, tabId),
          eq(transactionTabs.businessId, businessId),
        ),
      )
      .returning();

    return resumed;
  }

  async parkTab(businessId: string, tabId: string) {
    const tab = await this.getTab(businessId, tabId);

    const [parked] = await this.db
      .insert(heldCarts)
      .values({
        businessId: tab.businessId,
        locationId: tab.locationId,
        cashierId: tab.cashierId,
        customerId: tab.customerId,
        cartJson: tab.cartJson,
        sourceTabId: tab.id,
      })
      .returning();

    await this.db
      .delete(transactionTabs)
      .where(
        and(
          eq(transactionTabs.id, tabId),
          eq(transactionTabs.businessId, businessId),
        ),
      );

    return parked;
  }

  async closeTab(businessId: string, tabId: string) {
    await this.getTab(businessId, tabId);

    await this.db
      .delete(transactionTabs)
      .where(
        and(
          eq(transactionTabs.id, tabId),
          eq(transactionTabs.businessId, businessId),
        ),
      );

    return { deleted: true };
  }
}
