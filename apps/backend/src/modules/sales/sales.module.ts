import { Module } from '@nestjs/common';
import { CartController } from './controllers/cart.controller';
import { CartService } from './services/cart.service';
import { CheckoutController } from './controllers/checkout.controller';
import { CheckoutService } from './services/checkout.service';
import { TabController } from './controllers/tab.controller';
import { TabService } from './services/tab.service';
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [PricingModule],
  controllers: [CartController, CheckoutController, TabController],
  providers: [CartService, CheckoutService, TabService],
  exports: [CartService, CheckoutService, TabService],
})
export class SalesModule {}
