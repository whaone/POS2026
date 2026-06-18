import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

enum PaymentMethod {
  CASH = 'cash',
  TRANSFER = 'transfer',
  CHEQUE = 'cheque',
}

import { PartialType } from '@nestjs/mapped-types';

export class PurchaseItemDto {
  @IsUUID() productId: string;
  @IsOptional() @IsUUID() variationId?: string;
  @IsInt() @IsNotEmpty() qty: number;
  @IsInt() @IsNotEmpty() cost: number;
  @IsOptional() @IsInt() tax?: number;
  @IsOptional() @IsString() lotNumber?: string;
  @IsOptional() expiryDate?: Date;
}

export class CreatePurchaseDto {
  @IsUUID() @IsNotEmpty() locationId: string;
  @IsUUID() @IsNotEmpty() supplierId: string;
  @IsInt() subtotal: number;
  @IsInt() taxTotal: number;
  @IsInt() discount: number;
  @IsInt() shipping: number;
  @IsInt() grandTotal: number;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  items: PurchaseItemDto[];
}

export class UpdatePurchaseDto extends PartialType(CreatePurchaseDto) {}

export class PurchasePaymentDto {
  @IsEnum(PaymentMethod) method: PaymentMethod;
  @IsInt() amount: number;
  @IsOptional() @IsUUID() accountId?: string;
}

export class PurchaseReturnItemDto {
  @IsUUID() purchaseItemId: string;
  @IsUUID() productId: string;
  @IsInt() qty: number;
}

export class PurchaseReturnDto {
  @IsString() reason: string;
  @IsInt() amount: number;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseReturnItemDto)
  items: PurchaseReturnItemDto[];
}
