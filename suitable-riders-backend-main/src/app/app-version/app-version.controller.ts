import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Version,
} from '@nestjs/common';
import { ApiBody, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/@types/user-role-type';
import { AppVersionService } from './app-version.service';
import {
  CreateAppVersionReqDTO,
  CreateAppVersionReqSwaggerDTO,
  CreateAppVersionResDTO,
} from './dto/create-app-version.dto';
import { GetAppVersionsResDTO } from './dto/get-app-versions.dto';

@Controller({ path: 'api/app-version', version: ['0', '1'] })
export class AppVersionController {
  constructor(private appVersionService: AppVersionService) {}

  // Create AppVersion
  @Version('0')
  @Roles(UserRole.ADMIN)
  @Post('/')
  @ApiTags('AppVersion')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiBody({ type: CreateAppVersionReqSwaggerDTO })
  @ApiResponse({ status: HttpStatus.OK, type: CreateAppVersionResDTO })
  async createAppVersion(@Body() dto: CreateAppVersionReqDTO) {
    return this.appVersionService.createAppVersion(dto);
  }

  // Get AppVersion
  @Version('0')
  @Roles(UserRole.ADMIN)
  @Get('/')
  @ApiTags('AppVersion')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: GetAppVersionsResDTO })
  async getAppVersions() {
    return this.appVersionService.getAppVersions();
  }

  // Delete AppVersion
  @Version('0')
  @Roles(UserRole.ADMIN)
  @Delete('/:id')
  @ApiTags('AppVersion')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  async deleteAppVersion(@Param() id: string) {
    return this.appVersionService.deleteAppVersion(id);
  }
}
