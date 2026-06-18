import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreatePayrollDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  period: string;

  @IsInt()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  note?: string;
}

export class UpdatePayrollDto extends PartialType(CreatePayrollDto) {}
