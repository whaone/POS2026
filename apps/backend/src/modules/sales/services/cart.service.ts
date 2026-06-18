import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../../core/database/database.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  sales,
  saleItems,
  salePayments,
} from '../../../db/schema/sales.schema';
import { products, taxes } from '../../../db/schema/product.schema';
import { CreateCartDto, CartItemDto } from '../dto/create-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @Inject(DATABASE_TOKEN)
    private readonly db: NodePgDatabase,
  ) {}

  async createOrUpdateCart(
    businessId: string,
    locationId: string,
    cashierId: string,
    dto: CreateCartDto,
  ) {
    if (dto.saleId) {
      return this.updateCart(businessId, locationId, cashierId, dto);
    }
    return this.createCart(businessId, locationId, cashierId, dto);
  }

  private async createCart(
    businessId: string,
    locationId: string,
    cashierId: string,
    dto: CreateCartDto,
  ) {
    const resolvedItems = await this.resolveItems(businessId, dto.items || []);
    const totals = this.calculateTotals(resolvedItems);

    const [newSale] = await this.db
      .insert(sales)
      .values({
        businessId,
        locationId,
        customerId: dto.customerId,
        cashierId,
        subtotal: totals.subtotal,
        taxTotal: totals.taxTotal,
        discountTotal: totals.discountTotal,
        grandTotal: totals.grandTotal,
        status: 'held',
      })
      .returning();

    if (resolvedItems.length > 0) {
      const items = resolvedItems.map((item) => ({
        saleId: newSale.id,
        productId: item.productId,
        variationId: item.variationId,
        qty: item.qty,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        tax: item.tax || 0,
        lineTotal:
          item.unitPrice * item.qty - (item.discount || 0) + (item.tax || 0),
      }));

      await this.db.insert(saleItems).values(items);
    }

    return newSale;
  }

  private async updateCart(
    businessId: string,
    locationId: string,
    cashierId: string,
    dto: CreateCartDto,
  ) {
    const [existing] = await this.db
      .select()
      .from(sales)
      .where(and(eq(sales.id, dto.saleId!), eq(sales.businessId, businessId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException(`Sale ${dto.saleId} not found`);
    }

    await this.db.delete(saleItems).where(eq(saleItems.saleId, dto.saleId!));

    const resolvedItems = await this.resolveItems(businessId, dto.items || []);
    const totals = this.calculateTotals(resolvedItems);

    await this.db
      .update(sales)
      .set({
        subtotal: totals.subtotal,
        taxTotal: totals.taxTotal,
        discountTotal: totals.discountTotal,
        grandTotal: totals.grandTotal,
        customerId: dto.customerId,
      })
      .where(eq(sales.id, dto.saleId!));

    if (resolvedItems.length > 0) {
      const items = resolvedItems.map((item) => ({
        saleId: dto.saleId!,
        productId: item.productId,
        variationId: item.variationId,
        qty: item.qty,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        tax: item.tax || 0,
        lineTotal:
          item.unitPrice * item.qty - (item.discount || 0) + (item.tax || 0),
      }));

      await this.db.insert(saleItems).values(items);
    }

    const [updated] = await this.db
      .select()
      .from(sales)
      .where(eq(sales.id, dto.saleId!))
      .limit(1);
    return updated;
  }

  private calculateTotals(items: CartItemDto[]) {
    let subtotal = 0;
    let taxTotal = 0;
    let discountTotal = 0;

    for (const item of items) {
      const lineSubtotal = item.unitPrice * item.qty;
      const lineDiscount = item.discount || 0;
      const lineTax = item.tax || 0;

      subtotal += lineSubtotal;
      taxTotal += lineTax;
      discountTotal += lineDiscount;
    }

    const grandTotal = subtotal - discountTotal + taxTotal;

    return { subtotal, taxTotal, discountTotal, grandTotal };
  }

  async getCart(businessId: string, saleId: string) {
    const [sale] = await this.db
      .select()
      .from(sales)
      .where(and(eq(sales.id, saleId), eq(sales.businessId, businessId)))
      .limit(1);

    if (!sale) {
      throw new NotFoundException(`Sale ${saleId} not found`);
    }

    const items = await this.db
      .select()
      .from(saleItems)
      .where(eq(saleItems.saleId, saleId));

    return { ...sale, items };
  }

  async getReceipt(businessId: string, saleId: string) {
    const [sale] = await this.db
      .select()
      .from(sales)
      .where(and(eq(sales.id, saleId), eq(sales.businessId, businessId)))
      .limit(1);

    if (!sale) {
      throw new NotFoundException(`Sale ${saleId} not found`);
    }

    const items = await this.db
      .select()
      .from(saleItems)
      .where(eq(saleItems.saleId, saleId));

    const payments = await this.db
      .select()
      .from(salePayments)
      .where(eq(salePayments.saleId, saleId));

    return {
      sale,
      items,
      payments,
    };
  }

  private async resolveItems(businessId: string, dtos: CartItemDto[]) {
    const resolved: (CartItemDto & { productId: string })[] = [];
    for (const item of dtos) {
      if (item.barcode) {
        const [prod] = await this.db
          .select()
          .from(products)
          .where(
            and(
              eq(products.businessId, businessId),
              eq(products.barcode, item.barcode),
            ),
          )
          .limit(1);
        if (!prod)
          throw new BadRequestException(`Barcode ${item.barcode} not found`);

        let taxRate = 0;
        if (prod.taxId) {
          const [tax] = await this.db
            .select()
            .from(taxes)
            .where(eq(taxes.id, prod.taxId))
            .limit(1);
          if (tax) taxRate = Number(tax.rate);
        }

        resolved.push({
          ...item,
          productId: prod.id,
          unitPrice: item.unitPrice, // Ideally fetch from productPrices
          tax: Math.floor(item.unitPrice * (taxRate / 100)) * item.qty,
        });
      } else if (item.productId) {
        let taxRate = 0;
        const [prod] = await this.db
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);
        if (prod && prod.taxId) {
          const [tax] = await this.db
            .select()
            .from(taxes)
            .where(eq(taxes.id, prod.taxId))
            .limit(1);
          if (tax) taxRate = Number(tax.rate);
        }
        resolved.push({
          ...item,
          productId: item.productId,
          tax: Math.floor(item.unitPrice * (taxRate / 100)) * item.qty,
        });
      } else {
        throw new BadRequestException(
          'Item must have either barcode or productId',
        );
      }
    }
    return resolved;
  }
}
