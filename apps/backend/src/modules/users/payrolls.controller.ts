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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PayrollsService } from './payrolls.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../auth/auth.types';
import { CreatePayrollDto, UpdatePayrollDto } from './dto/payroll.dto';

@UseGuards(JwtAuthGuard)
@Controller('payroll')
export class PayrollsController {
  constructor(private readonly service: PayrollsService) {}

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.service.findAll(req.user.businessId);
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.findOne(req.user.businessId, id);
  }

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreatePayrollDto) {
    return this.service.create(req.user.businessId, dto);
  }

  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdatePayrollDto,
  ) {
    return this.service.update(req.user.businessId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.remove(req.user.businessId, id);
  }
}
