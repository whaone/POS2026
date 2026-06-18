import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CheckoutService } from '../services/checkout.service';
import { CheckoutPayDto } from '../dto/checkout.dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../auth/auth.types';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('pay')
  @HttpCode(HttpStatus.OK)
  async pay(@CurrentUser() user: JwtPayload, @Body() dto: CheckoutPayDto) {
    return this.checkoutService.processPayment(user.businessId, dto);
  }
}
