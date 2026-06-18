import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../auth/auth.types';
import { StockAdjustmentDto, StockTransferDto } from './dto/stock.dto';

@UseGuards(JwtAuthGuard)
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  getStock(@Req() req: RequestWithUser, @Query('location') locationId: string) {
    return this.stockService.getStock(req.user.businessId, locationId);
  }

  @Get('adjustments')
  findAllAdjustments(
    @Req() req: RequestWithUser,
    @Query('location') locationId?: string,
  ) {
    return this.stockService.findAllAdjustments(
      req.user.businessId,
      locationId,
    );
  }

  @Get('adjustments/:id')
  findAdjustment(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.stockService.findAdjustment(req.user.businessId, id);
  }

  @Post('adjustments')
  createAdjustment(
    @Req() req: RequestWithUser,
    @Body() dto: StockAdjustmentDto,
  ) {
    return this.stockService.createAdjustment({
      businessId: req.user.businessId,
      createdBy: req.user.sub,
      ...dto,
    });
  }

  @Post('transfers')
  createTransfer(@Req() req: RequestWithUser, @Body() dto: StockTransferDto) {
    return this.stockService.transferStock({
      businessId: req.user.businessId,
      ...dto,
    });
  }

  @Post('transfers/:id/complete')
  completeTransfer(@Param('id') id: string) {
    return this.stockService.completeTransfer(id);
  }
}
