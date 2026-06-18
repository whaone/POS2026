import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { AccountingService } from '../services/accounting.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../../auth/auth.types';

@UseGuards(JwtAuthGuard)
@Controller('accounting')
export class AccountingReportsController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get('balance-sheet')
  getBalanceSheet(@Req() req: RequestWithUser) {
    return this.accountingService.getBalanceSheet(req.user.businessId);
  }

  @Get('trial-balance')
  getTrialBalance(@Req() req: RequestWithUser) {
    return this.accountingService.getTrialBalance(req.user.businessId);
  }

  @Get('cash-flow')
  getCashFlow(
    @Req() req: RequestWithUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.accountingService.getCashFlow(
      req.user.businessId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
