import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../../core/database/database.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  products,
  productVariations,
  categories,
  brands,
  units,
  taxes,
} from '../../../db/schema/product.schema';
import {
  CreateProductDto,
  CreateProductVariationDto,
} from '../dto/create-product.dto';
import {
  UpdateProductDto,
  UpdateProductVariationDto,
} from '../dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(DATABASE_TOKEN)
    private readonly db: NodePgDatabase,
  ) {}

  async createProduct(businessId: string, dto: CreateProductDto) {
    const result = await this.db
      .insert(products)
      .values({
        businessId,
        ...dto,
      })
      .returning();
    return result[0];
  }

  async findAllProducts(businessId: string) {
    return this.db
      .select()
      .from(products)
      .where(eq(products.businessId, businessId));
  }

  async findProductById(businessId: string, id: string) {
    const result = await this.db
      .select()
      .from(products)
      .where(and(eq(products.businessId, businessId), eq(products.id, id)))
      .limit(1);

    if (!result.length) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return result[0];
  }

  async updateProduct(businessId: string, id: string, dto: UpdateProductDto) {
    await this.findProductById(businessId, id); // check exists

    const result = await this.db
      .update(products)
      .set({ ...dto, updatedAt: new Date() })
      .where(and(eq(products.businessId, businessId), eq(products.id, id)))
      .returning();

    return result[0];
  }

  async removeProduct(businessId: string, id: string) {
    await this.findProductById(businessId, id); // check exists
    await this.db
      .delete(products)
      .where(and(eq(products.businessId, businessId), eq(products.id, id)));
  }

  async findProductByBarcode(businessId: string, barcode: string) {
    const result = await this.db
      .select()
      .from(products)
      .where(
        and(eq(products.businessId, businessId), eq(products.barcode, barcode)),
      )
      .limit(1);

    if (!result.length) {
      throw new NotFoundException(`Product with barcode ${barcode} not found`);
    }
    return result[0];
  }

  // Variations
  async createVariation(dto: CreateProductVariationDto) {
    const result = await this.db
      .insert(productVariations)
      .values(dto)
      .returning();
    return result[0];
  }

  async findAllVariations(productId: string) {
    return this.db
      .select()
      .from(productVariations)
      .where(eq(productVariations.productId, productId));
  }

  async updateVariation(id: string, dto: UpdateProductVariationDto) {
    const result = await this.db
      .update(productVariations)
      .set(dto)
      .where(eq(productVariations.id, id))
      .returning();
    if (!result.length) {
      throw new NotFoundException(`Variation not found`);
    }
    return result[0];
  }

  async removeVariation(id: string) {
    const result = await this.db
      .delete(productVariations)
      .where(eq(productVariations.id, id))
      .returning();
    if (!result.length) {
      throw new NotFoundException(`Variation not found`);
    }
    return { success: true };
  }

  // Bulk import of already-parsed CSV rows (the client parses the file and
  // posts a row array). Each row becomes a product in a single transaction.
  async importCsv(businessId: string, productsData: CreateProductDto[]) {
    if (!productsData || productsData.length === 0) return [];

    return this.db.transaction(async (tx) => {
      const results: (typeof products.$inferSelect)[] = [];
      for (const dto of productsData) {
        const [product] = await tx
          .insert(products)
          .values({ businessId, ...dto })
          .returning();
        results.push(product);
      }
      return results;
    });
  }

  // Resolve printable barcode labels for the requested products. Returns one
  // label per unit (expanded by qty) carrying the data a label renderer or
  // ESC/POS driver needs. Actual printing happens on the client/hardware.
  async generateBarcodeLabels(
    businessId: string,
    payload: { productId: string; variationId?: string; qty: number }[],
  ) {
    const labels: {
      productId: string;
      variationId?: string;
      name: string;
      sku: string;
      barcode: string;
    }[] = [];

    for (const item of payload) {
      const product = await this.findProductById(businessId, item.productId);
      const copies = Math.max(1, Math.trunc(item.qty ?? 1));
      for (let i = 0; i < copies; i++) {
        labels.push({
          productId: product.id,
          variationId: item.variationId,
          name: product.name,
          sku: product.sku,
          // Fall back to SKU when no dedicated barcode is configured.
          barcode: product.barcode ?? product.sku,
        });
      }
    }

    return { count: labels.length, labels };
  }

  // Master data queries
  async findAllCategories(businessId: string) {
    return this.db
      .select()
      .from(categories)
      .where(eq(categories.businessId, businessId));
  }

  async findAllBrands(businessId: string) {
    return this.db
      .select()
      .from(brands)
      .where(eq(brands.businessId, businessId));
  }

  async findAllUnits(businessId: string) {
    return this.db.select().from(units).where(eq(units.businessId, businessId));
  }

  async findAllTaxes(businessId: string) {
    return this.db.select().from(taxes).where(eq(taxes.businessId, businessId));
  }
}
