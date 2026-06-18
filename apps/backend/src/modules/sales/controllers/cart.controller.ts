import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CartService } from '../services/cart.service';
import { CreateCartDto } from '../dto/create-cart.dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../auth/auth.types';

@Controller('sales')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('cart')
  @HttpCode(HttpStatus.OK)
  createOrUpdateCart(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateCartDto,
  ) {
    // locationId from user or request (for now, use a default or from header)
    return this.cartService.createOrUpdateCart(
      user.businessId,
      user.locationId || '',
      user.sub,
      dto,
    );
  }

  @Get('cart/:id')
  getCart(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.cartService.getCart(user.businessId, id);
  }

  @Get(':id/print')
  getReceipt(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.cartService.getReceipt(user.businessId, id);
  }
}
