import { SettingsService } from '../services/settings.service';
import type { RequestWithUser } from '../../auth/auth.types';
import { CreateInvoiceTemplateDto, UpdateInvoiceTemplateDto, CreateBarcodeSettingDto, CreateDeviceDto, UpdateDeviceDto } from '../dto/settings.dto';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    findAllTemplates(req: RequestWithUser): Promise<{
        id: string;
        businessId: string;
        name: string;
        layoutJson: unknown;
        isDefault: boolean;
        createdAt: Date;
    }[]>;
    createTemplate(req: RequestWithUser, dto: CreateInvoiceTemplateDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        businessId: string;
        layoutJson: unknown;
        isDefault: boolean;
    }>;
    updateTemplate(req: RequestWithUser, id: string, dto: UpdateInvoiceTemplateDto): Promise<{
        id: string;
        businessId: string;
        name: string;
        layoutJson: unknown;
        isDefault: boolean;
        createdAt: Date;
    }>;
    deleteTemplate(req: RequestWithUser, id: string): Promise<{
        success: boolean;
    }>;
    getBarcodeSetting(req: RequestWithUser): Promise<{
        id: string;
        businessId: string;
        labelSize: string | null;
        columns: number;
        symbology: string;
        fieldsJson: unknown;
    }>;
    updateBarcodeSetting(req: RequestWithUser, dto: CreateBarcodeSettingDto): Promise<{
        columns: number;
        id: string;
        businessId: string;
        labelSize: string | null;
        symbology: string;
        fieldsJson: unknown;
    }>;
    findAllDevices(req: RequestWithUser): Promise<{
        id: string;
        businessId: string;
        locationId: string | null;
        type: string;
        configJson: unknown;
    }[]>;
    createDevice(req: RequestWithUser, dto: CreateDeviceDto): Promise<{
        type: string;
        id: string;
        businessId: string;
        locationId: string | null;
        configJson: unknown;
    }>;
    updateDevice(req: RequestWithUser, id: string, dto: UpdateDeviceDto): Promise<{
        id: string;
        businessId: string;
        locationId: string | null;
        type: string;
        configJson: unknown;
    }>;
    deleteDevice(req: RequestWithUser, id: string): Promise<{
        success: boolean;
    }>;
}
