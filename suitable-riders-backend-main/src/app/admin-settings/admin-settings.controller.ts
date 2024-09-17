import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Put,
  Req,
  Version,
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommonApiResponses } from '../common/decorators/common-sagger.decorator';
import { Public } from '../common/decorators/public-route.decorator';

import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/@types/user-role-type';
import { AdminSettingServices } from './admin-settings.service';
import { GetAdminSettingSwaggerResponse } from './dto/get-admin-setting-swagger-response.dto';
import { SplashAminSettingSwaggerResponseDTO } from './dto/splash-admin-setting-swagger-response.dto';
import {
  UpdateAdminSettingsDTO,
  UpdateAdminSettingsSwaggerDTO,
} from './dto/update-admin-settings.dto';
import { Request } from 'express';

/**
 * Admin setting controller
 */
@Controller({ path: 'api/admin-settings/', version: ['0', '1'] })
export class AdminSettingController {
  constructor(private adminSettingService: AdminSettingServices) {}

  /**
   * Get admin settings
   */
  @Version('0')
  @Roles(UserRole.ADMIN)
  @Get('/')
  @ApiTags('Admin Settings')
  @ApiResponse({ type: GetAdminSettingSwaggerResponse, status: HttpStatus.OK })
  @CommonApiResponses()
  async getAdminSettings() {
    return this.adminSettingService.getAdminSettings();
  }

  /**
   * Update admin settings
   */
  @Version('0')
  @Roles(UserRole.ADMIN)
  @Put('/')
  @ApiTags('Admin Settings')
  @ApiBody({ type: UpdateAdminSettingsSwaggerDTO })
  @ApiResponse({ type: GetAdminSettingSwaggerResponse, status: HttpStatus.OK })
  @CommonApiResponses()
  async updateAdminSettings(@Body() dto: UpdateAdminSettingsDTO) {
    return this.adminSettingService.updateAdminSettings(dto);
  }

  /**
   * Splash call to get admin settings
   */
  @Version('0')
  @Public()
  @Get('/splash')
  @ApiTags('Admin Settings')
  @ApiResponse({
    type: SplashAminSettingSwaggerResponseDTO,
    status: HttpStatus.OK,
  })
  @CommonApiResponses()
  async getSplashAdminSetting(@Req() req: Request) {
    return this.adminSettingService.getSplashAdminSettings(req);
  }
}
