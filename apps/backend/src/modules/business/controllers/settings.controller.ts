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
import { SettingsService } from '../services/settings.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../../auth/auth.types';
import {
  CreateInvoiceTemplateDto,
  UpdateInvoiceTemplateDto,
  CreateBarcodeSettingDto,
  CreateDeviceDto,
  UpdateDeviceDto,
} from '../dto/settings.dto';

@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Invoice Templates
  @Get('invoice-templates')
  findAllTemplates(@Req() req: RequestWithUser) {
    return this.settingsService.findAllInvoiceTemplates(req.user.businessId);
  }

  @Post('invoice-templates')
  createTemplate(
    @Req() req: RequestWithUser,
    @Body() dto: CreateInvoiceTemplateDto,
  ) {
    return this.settingsService.createInvoiceTemplate(req.user.businessId, dto);
  }

  @Patch('invoice-templates/:id')
  updateTemplate(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceTemplateDto,
  ) {
    return this.settingsService.updateInvoiceTemplate(
      req.user.businessId,
      id,
      dto,
    );
  }

  @Delete('invoice-templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTemplate(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.settingsService.deleteInvoiceTemplate(req.user.businessId, id);
  }

  // Barcode Settings
  @Get('barcode')
  getBarcodeSetting(@Req() req: RequestWithUser) {
    return this.settingsService.getBarcodeSetting(req.user.businessId);
  }

  @Patch('barcode')
  updateBarcodeSetting(
    @Req() req: RequestWithUser,
    @Body() dto: CreateBarcodeSettingDto,
  ) {
    return this.settingsService.upsertBarcodeSetting(req.user.businessId, dto);
  }

  // Devices
  @Get('devices')
  findAllDevices(@Req() req: RequestWithUser) {
    return this.settingsService.findAllDevices(req.user.businessId);
  }

  @Post('devices')
  createDevice(@Req() req: RequestWithUser, @Body() dto: CreateDeviceDto) {
    return this.settingsService.createDevice(req.user.businessId, dto);
  }

  @Patch('devices/:id')
  updateDevice(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateDeviceDto,
  ) {
    return this.settingsService.updateDevice(req.user.businessId, id, dto);
  }

  @Delete('devices/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDevice(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.settingsService.deleteDevice(req.user.businessId, id);
  }
}
