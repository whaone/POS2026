import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateExpenseDto {
  @IsUUID()
  @IsNotEmpty()
  locationId: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsInt()
  @IsNotEmpty()
  amount: number;

  @IsUUID()
  @IsOptional()
  accountId?: string;

  @IsString()
  @IsOptional()
  note?: string;
}

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {}
