import { Controller, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { BookingService } from '../services/booking.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../../auth/auth.types';
import { CreatePreorderDto } from '../dto/booking.dto';

@UseGuards(JwtAuthGuard)
@Controller('preorders')
export class PreorderController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  createPreorder(@Req() req: RequestWithUser, @Body() dto: CreatePreorderDto) {
    return this.bookingService.createPreorder(req.user.businessId, dto);
  }

  @Post(':id/collect')
  collectPreorder(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.bookingService.collectPreorder(req.user.businessId, id);
  }
}
