export declare class CreateInvoiceTemplateDto {
    name: string;
    layoutJson?: Record<string, any>;
}
declare const UpdateInvoiceTemplateDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateInvoiceTemplateDto>>;
export declare class UpdateInvoiceTemplateDto extends UpdateInvoiceTemplateDto_base {
}
export declare class CreateBarcodeSettingDto {
    labelSize?: string;
    symbology?: string;
    fieldsJson?: Record<string, any>[];
}
declare const UpdateBarcodeSettingDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateBarcodeSettingDto>>;
export declare class UpdateBarcodeSettingDto extends UpdateBarcodeSettingDto_base {
}
export declare class CreateDeviceDto {
    locationId: string;
    type: string;
    configJson?: Record<string, any>;
}
declare const UpdateDeviceDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateDeviceDto>>;
export declare class UpdateDeviceDto extends UpdateDeviceDto_base {
}
export {};
