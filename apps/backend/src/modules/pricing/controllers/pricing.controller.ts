import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PricingService } from '../services/pricing.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../../auth/auth.types';

@UseGuards(JwtAuthGuard)
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('quote')
  async getQuote(
    @Query('productId') productId: string,
    @Query('customerId') customerId?: string,
    @Query('qty') qty?: number,
  ) {
    return this.pricingService.getQuote(
      productId,
      customerId,
      qty ? Number(qty) : 1,
    );
  }

  @Post('discounts')
  async createDiscount(@Req() req: RequestWithUser, @Body() data: any) {
    return this.pricingService.createDiscount(req.user.businessId, data);
  }

  @Get('discounts')
  async findAllDiscounts(@Req() req: RequestWithUser) {
    return this.pricingService.findAllDiscounts(req.user.businessId);
  }

  @Post('markdowns')
  async createMarkdown(@Req() req: RequestWithUser, @Body() data: any) {
    return this.pricingService.createMarkdown(req.user.businessId, data);
  }

  @Get('markdowns')
  async findAllMarkdowns(@Req() req: RequestWithUser) {
    return this.pricingService.findAllMarkdowns(req.user.businessId);
  }
}
