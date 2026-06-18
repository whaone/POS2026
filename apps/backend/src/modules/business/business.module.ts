import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { UsersModule } from '../users/users.module';
import { LocationModule } from './location.module';

@Module({
  imports: [UsersModule, LocationModule],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
