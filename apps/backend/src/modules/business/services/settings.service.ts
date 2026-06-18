import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../../core/database/database.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  invoiceTemplates,
  barcodeSettings,
  devices,
} from '../../../db/schema/business.schema';
import {
  CreateInvoiceTemplateDto,
  UpdateInvoiceTemplateDto,
  CreateBarcodeSettingDto,
  CreateDeviceDto,
  UpdateDeviceDto,
} from '../dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @Inject(DATABASE_TOKEN)
    private readonly db: NodePgDatabase,
  ) {}

  // Invoice Templates
  async createInvoiceTemplate(
    businessId: string,
    dto: CreateInvoiceTemplateDto,
  ) {
    const [template] = await this.db
      .insert(invoiceTemplates)
      .values({
        businessId,
        name: dto.name,
        layoutJson: dto.layoutJson || {},
      })
      .returning();
    return template;
  }

  async findAllInvoiceTemplates(businessId: string) {
    return this.db
      .select()
      .from(invoiceTemplates)
      .where(eq(invoiceTemplates.businessId, businessId));
  }

  async updateInvoiceTemplate(
    businessId: string,
    id: string,
    dto: UpdateInvoiceTemplateDto,
  ) {
    const [template] = await this.db
      .select()
      .from(invoiceTemplates)
      .where(
        and(
          eq(invoiceTemplates.id, id),
          eq(invoiceTemplates.businessId, businessId),
        ),
      );

    if (!template) throw new NotFoundException('Template not found');

    const [updated] = await this.db
      .update(invoiceTemplates)
      .set(dto)
      .where(eq(invoiceTemplates.id, id))
      .returning();
    return updated;
  }

  async deleteInvoiceTemplate(businessId: string, id: string) {
    await this.db
      .delete(invoiceTemplates)
      .where(
        and(
          eq(invoiceTemplates.id, id),
          eq(invoiceTemplates.businessId, businessId),
        ),
      );
    return { success: true };
  }

  // Barcode Settings
  async getBarcodeSetting(businessId: string) {
    const [setting] = await this.db
      .select()
      .from(barcodeSettings)
      .where(eq(barcodeSettings.businessId, businessId))
      .limit(1);
    return setting || null;
  }

  async upsertBarcodeSetting(businessId: string, dto: CreateBarcodeSettingDto) {
    const existing = await this.getBarcodeSetting(businessId);

    if (existing) {
      const [updated] = await this.db
        .update(barcodeSettings)
        .set(dto)
        .where(eq(barcodeSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await this.db
        .insert(barcodeSettings)
        .values({
          businessId,
          ...dto,
        })
        .returning();
      return created;
    }
  }

  // Devices
  async createDevice(businessId: string, dto: CreateDeviceDto) {
    const [device] = await this.db
      .insert(devices)
      .values({
        businessId,
        ...dto,
      })
      .returning();
    return device;
  }

  async findAllDevices(businessId: string) {
    return this.db
      .select()
      .from(devices)
      .where(eq(devices.businessId, businessId));
  }

  async updateDevice(businessId: string, id: string, dto: UpdateDeviceDto) {
    const [device] = await this.db
      .select()
      .from(devices)
      .where(and(eq(devices.id, id), eq(devices.businessId, businessId)));

    if (!device) throw new NotFoundException('Device not found');

    const [updated] = await this.db
      .update(devices)
      .set(dto)
      .where(eq(devices.id, id))
      .returning();
    return updated;
  }

  async deleteDevice(businessId: string, id: string) {
    await this.db
      .delete(devices)
      .where(and(eq(devices.id, id), eq(devices.businessId, businessId)));
    return { success: true };
  }
}
