import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CashMovementDto {
  @IsInt()
  @Min(1)
  amount: number;

  @IsString()
  @IsOptional()
  ref?: string;
}
