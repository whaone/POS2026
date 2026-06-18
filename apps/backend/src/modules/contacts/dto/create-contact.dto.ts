import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';

enum ContactType {
  SUPPLIER = 'supplier',
  CUSTOMER = 'customer',
  BOTH = 'both',
}

export class CreateContactDto {
  @IsEnum(ContactType)
  type: ContactType;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsNumber()
  payTermDays?: number;

  @IsOptional()
  @IsNumber()
  creditLimit?: number;

  @IsOptional()
  @IsNumber()
  openingBalance?: number;
}
