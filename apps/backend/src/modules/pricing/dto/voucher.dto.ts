import { IsString, IsNotEmpty } from 'class-validator';

export class ValidateVoucherDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  purchaseAmount: number;
}

export class RedeemVoucherDto {
  @IsString()
  @IsNotEmpty()
  voucherCode: string;

  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @IsString()
  @IsNotEmpty()
  branchId: string;

  @IsString()
  @IsNotEmpty()
  cashierId: string;

  @IsNotEmpty()
  amountUsed: number;
}
