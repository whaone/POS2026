import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentMethod {
  CASH = 'cash',
  QRIS = 'qris',
  CARD = 'card',
  CHEQUE = 'cheque',
  TRANSFER = 'transfer',
  VOUCHER = 'voucher',
  POINTS = 'points',
}

export class PaymentDto {
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  method: PaymentMethod;

  @IsInt()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsUUID()
  accountId?: string;

  @IsOptional()
  @IsString()
  ref?: string;

  @IsOptional()
  @IsString()
  voucherCode?: string;
}

export class CheckoutPayDto {
  @IsUUID()
  @IsNotEmpty()
  saleId: string;

  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentDto)
  @IsNotEmpty()
  payments: PaymentDto[];
}
