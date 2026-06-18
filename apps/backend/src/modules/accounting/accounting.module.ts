import { Module } from '@nestjs/common';
import { AccountingController } from './controllers/accounting.controller';
import { AccountingReportsController } from './controllers/accounting-reports.controller';
import { AccountingService } from './services/accounting.service';

@Module({
  controllers: [AccountingController, AccountingReportsController],
  providers: [AccountingService],
  exports: [AccountingService],
})
export class AccountingModule {}
