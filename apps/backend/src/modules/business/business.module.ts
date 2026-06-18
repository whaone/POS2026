import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { UsersModule } from '../users/users.module';
import { LocationModule } from './location.module';
import { SettingsService } from './services/settings.service';
import { SettingsController } from './controllers/settings.controller';

@Module({
  imports: [UsersModule, LocationModule],
  controllers: [BusinessController, SettingsController],
  providers: [BusinessService, SettingsService],
  exports: [BusinessService, SettingsService],
})
export class BusinessModule {}
