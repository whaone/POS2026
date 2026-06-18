import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateInvoiceTemplateDto, UpdateInvoiceTemplateDto, CreateBarcodeSettingDto, CreateDeviceDto, UpdateDeviceDto } from '../dto/settings.dto';
export declare class SettingsService {
    private readonly db;
    constructor(db: NodePgDatabase);
    createInvoiceTemplate(businessId: string, dto: CreateInvoiceTemplateDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        businessId: string;
        layoutJson: unknown;
        isDefault: boolean;
    }>;
    findAllInvoiceTemplates(businessId: string): Promise<{
        id: string;
        businessId: string;
        name: string;
        layoutJson: unknown;
        isDefault: boolean;
        createdAt: Date;
    }[]>;
    updateInvoiceTemplate(businessId: string, id: string, dto: UpdateInvoiceTemplateDto): Promise<{
        id: string;
        businessId: string;
        name: string;
        layoutJson: unknown;
        isDefault: boolean;
        createdAt: Date;
    }>;
    deleteInvoiceTemplate(businessId: string, id: string): Promise<{
        success: boolean;
    }>;
    getBarcodeSetting(businessId: string): Promise<{
        id: string;
        businessId: string;
        labelSize: string | null;
        columns: number;
        symbology: string;
        fieldsJson: unknown;
    }>;
    upsertBarcodeSetting(businessId: string, dto: CreateBarcodeSettingDto): Promise<{
        columns: number;
        id: string;
        businessId: string;
        labelSize: string | null;
        symbology: string;
        fieldsJson: unknown;
    }>;
    createDevice(businessId: string, dto: CreateDeviceDto): Promise<{
        type: string;
        id: string;
        businessId: string;
        locationId: string | null;
        configJson: unknown;
    }>;
    findAllDevices(businessId: string): Promise<{
        id: string;
        businessId: string;
        locationId: string | null;
        type: string;
        configJson: unknown;
    }[]>;
    updateDevice(businessId: string, id: string, dto: UpdateDeviceDto): Promise<{
        id: string;
        businessId: string;
        locationId: string | null;
        type: string;
        configJson: unknown;
    }>;
    deleteDevice(businessId: string, id: string): Promise<{
        success: boolean;
    }>;
}
