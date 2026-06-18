import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

enum AccountType {
  CASH = 'cash',
  BANK = 'bank',
  EWALLET = 'ewallet',
  OTHER = 'other',
}

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(AccountType)
  type: AccountType;

  @IsInt()
  @IsOptional()
  openingBalance?: number;
}

export class UpdateAccountDto extends PartialType(CreateAccountDto) {}
