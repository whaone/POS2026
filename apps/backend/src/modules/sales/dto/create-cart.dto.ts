import {
  IsArray,
  IsInt,
  IsOptional,
  IsUUID,
  ValidateNested,
  Min,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CartItemDto {
  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsUUID()
  variationId?: string;

  @IsInt()
  @Min(1)
  qty: number;

  @IsInt()
  @Min(0)
  unitPrice: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  tax?: number;
}

export class CreateCartDto {
  @IsOptional()
  @IsUUID()
  saleId?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  @IsOptional()
  items?: CartItemDto[];
}
