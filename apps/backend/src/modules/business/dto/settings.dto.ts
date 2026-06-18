import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateInvoiceTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  layoutJson?: Record<string, any>;
}

export class UpdateInvoiceTemplateDto extends PartialType(
  CreateInvoiceTemplateDto,
) {}

export class CreateBarcodeSettingDto {
  @IsString()
  @IsOptional()
  labelSize?: string;

  @IsString()
  @IsOptional()
  symbology?: string;

  @IsOptional()
  fieldsJson?: Record<string, any>[];
}

export class UpdateBarcodeSettingDto extends PartialType(
  CreateBarcodeSettingDto,
) {}

export class CreateDeviceDto {
  @IsUUID()
  @IsNotEmpty()
  locationId: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  configJson?: Record<string, any>;
}

export class UpdateDeviceDto extends PartialType(CreateDeviceDto) {}
