import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

enum BookingType {
  TABLE = 'table',
  STAFF = 'staff',
  SLOT = 'slot',
}

enum BookingStatus {
  CONFIRMED = 'confirmed',
  COLLECTED = 'collected',
  CANCELLED = 'cancelled',
}

export class CreateBookingDto {
  @IsUUID()
  @IsNotEmpty()
  locationId: string;

  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @IsEnum(BookingType)
  type: BookingType;

  @IsString()
  @IsOptional()
  resourceId?: string;

  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @IsInt()
  @IsOptional()
  dpAmount?: number;
}

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;
}

export class BookingDepositDto {
  @IsInt()
  @IsNotEmpty()
  amount: number;
}

export class CreatePreorderItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsUUID()
  @IsOptional()
  variationId?: string;

  @IsInt()
  @IsNotEmpty()
  qty: number;
}

export class CreatePreorderDto {
  @IsUUID()
  @IsNotEmpty()
  locationId: string;

  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  pickupCode?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePreorderItemDto)
  items: CreatePreorderItemDto[];
}
