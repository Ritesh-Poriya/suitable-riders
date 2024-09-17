import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Version,
} from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommonApiResponses } from '../common/decorators/common-sagger.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/@types/user-role-type';
import { DashboardService } from './dashboard.services';
import {
  DashboardForMerchantResDTO,
  DashboardResDTO,
  FilterJobReqDTO,
} from './dto/dashboard.dto';
import { GetUser } from '../common/decorators/user-param.decorator';
import { UserPayload } from '../jwt/@types/user-payload.interface';

@Controller({ path: 'api/dashboard', version: ['0', '1'] })
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Version('0')
  @Roles(UserRole.ADMIN)
  @Get('/')
  @ApiTags('dashboard')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: DashboardResDTO })
  @CommonApiResponses()
  public async getDashboardDetails() {
    return await this.dashboardService.getDashBoardDetails();
  }

  @Version('0')
  @Roles(UserRole.MERCHANT)
  @Post('/merchant')
  @ApiTags('dashboard')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: DashboardForMerchantResDTO })
  @CommonApiResponses()
  public async getDashboardDetailsForMerchant(
    @Body() dto: FilterJobReqDTO,
    @GetUser() user: UserPayload,
  ) {
    return await this.dashboardService.getDashboardDetailsForMerchant(
      user,
      dto,
    );
  }
}
