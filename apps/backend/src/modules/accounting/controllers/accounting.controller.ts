import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AccountingService } from '../services/accounting.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../../auth/auth.types';
import { CreateAccountDto, UpdateAccountDto } from '../dto/accounting.dto';

@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.accountingService.findAllAccounts(req.user.businessId);
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.accountingService.findAccount(req.user.businessId, id);
  }

  @Get(':id/report')
  getAccountReport(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.accountingService.getAccountReport(
      req.user.businessId,
      id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateAccountDto) {
    return this.accountingService.createAccount(req.user.businessId, dto);
  }

  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountingService.updateAccount(req.user.businessId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.accountingService.deleteAccount(req.user.businessId, id);
  }
}
