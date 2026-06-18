import { Module } from '@nestjs/common';
import { CustomersService } from './services/customers.service';
import { LoyaltyService } from './services/loyalty.service';
import { CustomersController } from './controllers/customers.controller';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService, LoyaltyService],
  exports: [CustomersService, LoyaltyService],
})
export class CustomersModule {}
