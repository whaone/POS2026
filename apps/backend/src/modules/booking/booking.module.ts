import { Module } from '@nestjs/common';
import { BookingController } from './controllers/booking.controller';
import { PreorderController } from './controllers/preorder.controller';
import { BookingService } from './services/booking.service';

@Module({
  controllers: [BookingController, PreorderController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
