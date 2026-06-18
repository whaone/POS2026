import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TabService } from '../services/tab.service';
import { UpdateTabDto } from '../dto/update-tab.dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../auth/auth.types';

@Controller('sales/tabs')
export class TabController {
  constructor(private readonly tabService: TabService) {}

  @Get()
  listTabs(@CurrentUser() user: JwtPayload) {
    return this.tabService.listTabs(user.businessId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  openTab(@CurrentUser() user: JwtPayload) {
    return this.tabService.openTab(
      user.businessId,
      user.locationId || '',
      user.sub,
    );
  }

  @Get(':id')
  getTab(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.tabService.getTab(user.businessId, id);
  }

  @Patch(':id')
  updateTab(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTabDto,
  ) {
    return this.tabService.updateTab(user.businessId, id, dto);
  }

  @Post(':id/hold')
  @HttpCode(HttpStatus.OK)
  holdTab(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.tabService.holdTab(user.businessId, id);
  }

  @Post(':id/resume')
  @HttpCode(HttpStatus.OK)
  resumeTab(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.tabService.resumeTab(user.businessId, id);
  }

  @Post(':id/park')
  @HttpCode(HttpStatus.OK)
  parkTab(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.tabService.parkTab(user.businessId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  closeTab(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.tabService.closeTab(user.businessId, id);
  }
}
