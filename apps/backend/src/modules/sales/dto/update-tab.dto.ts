import { IsOptional, IsString, IsInt, Min, IsUUID } from 'class-validator';

export class UpdateTabDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsString()
  cartJson?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  itemCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  subtotalAmount?: number;
}
