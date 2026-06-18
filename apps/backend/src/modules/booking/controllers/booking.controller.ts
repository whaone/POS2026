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
import { BookingService } from '../services/booking.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../../auth/auth.types';
import {
  CreateBookingDto,
  UpdateBookingDto,
  BookingDepositDto,
} from '../dto/booking.dto';

@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  findAll(@Req() req: RequestWithUser, @Query('location') locationId?: string) {
    return this.bookingService.findAll(req.user.businessId, locationId);
  }

  @Get('calendar')
  findByCalendar(
    @Req() req: RequestWithUser,
    @Query('location') locationId: string,
    @Query('start') startDate: string,
    @Query('end') endDate: string,
  ) {
    return this.bookingService.findByCalendar(
      req.user.businessId,
      locationId,
      startDate,
      endDate,
    );
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.bookingService.findOne(req.user.businessId, id);
  }

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateBookingDto) {
    return this.bookingService.create(req.user.businessId, dto);
  }

  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateBookingDto,
  ) {
    return this.bookingService.update(req.user.businessId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.bookingService.remove(req.user.businessId, id);
  }

  @Post(':id/deposit')
  addDeposit(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: BookingDepositDto,
  ) {
    return this.bookingService.addDeposit(req.user.businessId, id, dto);
  }
}
