import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { VoucherService } from '../services/voucher.service';
import { ValidateVoucherDto, RedeemVoucherDto } from '../dto/voucher.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('vouchers')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post('validate')
  async validate(@Body() validateDto: ValidateVoucherDto) {
    return this.voucherService.validateVoucher(
      validateDto.code,
      validateDto.purchaseAmount,
    );
  }

  @Post('redeem')
  async redeem(@Body() redeemDto: RedeemVoucherDto) {
    return this.voucherService.redeemVoucher(redeemDto);
  }
}
