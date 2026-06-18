/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import { discounts, markdowns } from '../../../db/schema/pricing.schema';
import { products, productPrices } from '../../../db/schema/product.schema';
import { customers } from '../../../db/schema/customer.schema';

@Injectable()
export class PricingService {
  constructor(@Inject('DB_CLIENT') private readonly db: NodePgDatabase) {}

  async getQuote(productId: string, customerId?: string, qty: number = 1) {
    const [product] = await this.db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    let basePrice = 0;
    let priceGroupId: string | null = null;

    // If customer is provided, check their price group (FR-PRC-01, BR-06)
    if (customerId) {
      const [customer] = await this.db
        .select()
        .from(customers)
        .where(eq(customers.id, customerId));

      if (customer && customer.priceGroupId) {
        priceGroupId = customer.priceGroupId;
      }
    }

    // Get price from price group
    if (priceGroupId) {
      const [priceRecord] = await this.db
        .select()
        .from(productPrices)
        .where(
          and(
            eq(productPrices.productId, productId),
            eq(productPrices.priceGroupId, priceGroupId),
          ),
        );

      if (priceRecord) {
        basePrice = priceRecord.price;
      }
    }

    // Check for automated markdown (FR-PRC-03, BR-12)
    const activeMarkdown = await this.db
      .select()
      .from(markdowns)
      .where(
        and(eq(markdowns.productId, productId), eq(markdowns.rule, 'hour')),
      );

    let finalPrice = basePrice * qty;

    // Apply active markdown if any
    if (activeMarkdown.length > 0) {
      const config = activeMarkdown[0].configJson as any;
      if (config && config.discountPercent) {
        finalPrice = finalPrice * (1 - config.discountPercent / 100);
      }
    }

    // Get active conditional discounts (FR-PRC-02)
    const activeDiscounts = await this.db
      .select()
      .from(discounts)
      .where(and(eq(discounts.active, true)));

    return {
      productId,
      customerId,
      basePrice,
      priceGroupId,
      qty,
      finalPrice: Math.round(finalPrice),
      activeDiscounts: activeDiscounts.map((d) => ({
        id: d.id,
        type: d.type,
        config: d.configJson,
      })),
    };
  }

  async createDiscount(businessId: string, data: any) {
    const [discount] = await this.db
      .insert(discounts)
      .values({
        businessId,
        type: data.type,
        configJson: data.configJson,
        startDate: data.startDate,
        endDate: data.endDate,
        active: data.active ?? true,
      })
      .returning();

    return discount;
  }

  async findAllDiscounts(businessId: string) {
    return this.db
      .select()
      .from(discounts)
      .where(eq(discounts.businessId, businessId));
  }

  async createMarkdown(businessId: string, data: any) {
    const [markdown] = await this.db
      .insert(markdowns)
      .values({
        businessId,
        productId: data.productId,
        rule: data.rule,
        configJson: data.configJson,
      })
      .returning();

    return markdown;
  }

  async findAllMarkdowns(businessId: string) {
    return this.db
      .select()
      .from(markdowns)
      .where(eq(markdowns.businessId, businessId));
  }
}
