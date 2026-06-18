import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateBusinessDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @Length(3, 3)
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  financialYearStartMonth?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  profitMargin?: number;

  @IsString()
  @IsOptional()
  taxNumber?: string;
}
