import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
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
