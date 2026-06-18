import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PurchasesService } from '../services/purchases.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../../auth/auth.types';
import {
  CreatePurchaseDto,
  UpdatePurchaseDto,
  PurchasePaymentDto,
  PurchaseReturnDto,
} from '../dto/purchase.dto';

@UseGuards(JwtAuthGuard)
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.purchasesService.findAll(req.user.businessId);
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.purchasesService.findOne(req.user.businessId, id);
  }

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreatePurchaseDto) {
    return this.purchasesService.create(req.user.businessId, dto);
  }

  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseDto,
  ) {
    return this.purchasesService.update(req.user.businessId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.purchasesService.remove(req.user.businessId, id);
  }

  @Post(':id/receive')
  receive(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.purchasesService.receivePurchase(req.user.businessId, id);
  }

  @Post(':id/pay')
  createPayment(@Param('id') id: string, @Body() dto: PurchasePaymentDto) {
    return this.purchasesService.createPayment(id, dto);
  }

  @Post(':id/return')
  createReturn(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: PurchaseReturnDto,
  ) {
    return this.purchasesService.createReturn(req.user.businessId, id, dto);
  }
}
