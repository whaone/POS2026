import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ReportsService } from '../services/reports.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../../auth/auth.types';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('profit-loss')
  getProfitLoss(
    @Req() req: RequestWithUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getProfitLoss(
      req.user.businessId,
      startDate,
      endDate,
    );
  }

  @Get('purchase-sell')
  getPurchaseSell(
    @Req() req: RequestWithUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getPurchaseSellReport(
      req.user.businessId,
      startDate,
      endDate,
    );
  }

  @Get('stock')
  getStock(@Req() req: RequestWithUser) {
    return this.reportsService.getStockReport(req.user.businessId);
  }

  @Get('tax')
  getTax(@Req() req: RequestWithUser) {
    return this.reportsService.getTaxReport(req.user.businessId);
  }

  @Get('expense')
  getExpense(@Req() req: RequestWithUser) {
    return this.reportsService.getExpenseReport(req.user.businessId);
  }

  @Get('contacts')
  getContacts(@Req() req: RequestWithUser) {
    return this.reportsService.getContactsReport(req.user.businessId);
  }

  @Get('cash-register')
  getCashRegister(@Req() req: RequestWithUser) {
    return this.reportsService.getCashRegisterReport(req.user.businessId);
  }

  @Get('salesperson')
  getSalesperson(@Req() req: RequestWithUser) {
    return this.reportsService.getSalespersonReport(req.user.businessId);
  }

  @Get('product-performance')
  getProductPerformance(@Req() req: RequestWithUser) {
    return this.reportsService.getProductPerformance(req.user.businessId);
  }

  @Get('vouchers')
  getVoucherReport(@Req() req: RequestWithUser) {
    return this.reportsService.getVoucherReport(req.user.businessId);
  }
}
