import { Module } from '@nestjs/common';
import { VoucherService } from './services/voucher.service';
import { PricingService } from './services/pricing.service';
import { VoucherController } from './controllers/voucher.controller';
import { PricingController } from './controllers/pricing.controller';

@Module({
  controllers: [VoucherController, PricingController],
  providers: [VoucherService, PricingService],
  exports: [VoucherService, PricingService],
})
export class PricingModule {}
