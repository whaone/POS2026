import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CashRegisterService } from './cash-register.service';
import { OpenRegisterDto } from './dto/open-register.dto';
import { CashMovementDto } from './dto/cash-movement.dto';
import { CloseRegisterDto } from './dto/close-register.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/auth.types';

@Controller('register')
export class CashRegisterController {
  constructor(private readonly cashRegisterService: CashRegisterService) {}

  @Post('open')
  @HttpCode(HttpStatus.CREATED)
  openRegister(@CurrentUser() user: JwtPayload, @Body() dto: OpenRegisterDto) {
    return this.cashRegisterService.openRegister(
      user.businessId,
      user.sub,
      dto,
    );
  }

  @Get('current')
  getCurrent(@CurrentUser() user: JwtPayload) {
    return this.cashRegisterService.getCurrent(user.businessId, user.sub);
  }

  @Post('cash-in')
  @HttpCode(HttpStatus.OK)
  cashIn(@CurrentUser() user: JwtPayload, @Body() dto: CashMovementDto) {
    return this.cashRegisterService.cashIn(user.businessId, user.sub, dto);
  }

  @Post('cash-out')
  @HttpCode(HttpStatus.OK)
  cashOut(@CurrentUser() user: JwtPayload, @Body() dto: CashMovementDto) {
    return this.cashRegisterService.cashOut(user.businessId, user.sub, dto);
  }

  @Post('close')
  @HttpCode(HttpStatus.OK)
  closeRegister(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CloseRegisterDto,
  ) {
    return this.cashRegisterService.closeRegister(
      user.businessId,
      user.sub,
      dto,
    );
  }
}
