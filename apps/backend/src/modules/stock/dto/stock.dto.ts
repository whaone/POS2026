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

enum AdjustmentType {
  INCREASE = 'increase',
  DECREASE = 'decrease',
}

export class StockItemDto {
  @IsUUID() productId: string;
  @IsOptional() @IsUUID() variationId?: string;
  @IsInt() @IsNotEmpty() qty: number;
}

export class StockAdjustmentDto {
  @IsUUID() @IsNotEmpty() locationId: string;
  @IsEnum(AdjustmentType) type: AdjustmentType;
  @IsString() @IsOptional() reason?: string;
  @IsInt() @IsOptional() recoveryAmount?: number;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockItemDto)
  items: StockItemDto[];
}

export class StockTransferDto {
  @IsUUID() @IsNotEmpty() fromLocationId: string;
  @IsUUID() @IsNotEmpty() toLocationId: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockItemDto)
  items: StockItemDto[];
}
