import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Version,
} from '@nestjs/common';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CommonApiResponses } from '../common/decorators/common-sagger.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/user-param.decorator';
import { UserPayload } from '../jwt/@types/user-payload.interface';
import { UserRole } from '../users/@types/user-role-type';
import { DriverProfileService } from './driver-profile.service';
import {
  CreateDriverProfileReqDTO,
  CreateDriverProfileReqSwaggerDTO,
} from './dto/create-driver-profile.dto';
import { DeleteDriverProfileResDTO } from './dto/delete-driver-profile.dto';
import { GetDriverProfileResDTO } from './dto/get-driver-profile.dto';
import { GetDriverProfilesResDTO } from './dto/get-driver-profiles.dto';
import { GetMyDriverProfileResDTO } from './dto/get-my-driver-profile.dto';
import {
  SearchDriverProfileReqDTO,
  ServiceDriverProfileResDTO,
  ServiceDriverProfileSwaggerReqDTO,
} from './dto/search-driver-profile.dto';
import {
  UpdateDriverAvailabilityStatusReqDTO,
  UpdateDriverAvailabilityStatusResDTO,
  UpdateDriverAvailabilityStatusSwaggerReqDTO,
} from './dto/update-driver-availability.dto';
import {
  UpdateDriverProfileStatusReqDTO,
  UpdateDriverProfileStatusResDTO,
  UpdateDriverProfileStatusSwaggerReqDTO,
} from './dto/update-driver-profile-status.dto';
import {
  UpdateDriverProfileReqDTO,
  UpdateDriverProfileResDTO,
  UpdateDriverProfileSwaggerReqDTO,
} from './dto/update-driver-profile.dto';
import { UpdateDriverProfileVerificationStatusReqDTO, UpdateDriverProfileVerificationStatusResDTO, UpdateDriverProfileVerificationStatusSwaggerReqDTO } from './dto/update-driver-profile-verification-status.dto';
import { GetPendingDriverProfilesCountResDTO } from './dto/get-pending-profile-count.dto';
@Controller({ path: 'api/driverProfile', version: ['0', '1'] })
export class DriverProfileController {
  constructor(private driverProfileService: DriverProfileService) {}

  //Create Driver Profile
  @Version('0')
  @Post('/')
  @ApiTags('Driver Profile')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiBody({ type: CreateDriverProfileReqSwaggerDTO })
  async createDriverProfile(
    @Body() dto: CreateDriverProfileReqDTO,
    @GetUser() user: UserPayload,
  ) {
    return this.driverProfileService.createDriverProfile(dto, user);
  }

  //Get my driver profile
  @Version('0')
  @Get('/me')
  @ApiTags('Driver Profile')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: GetMyDriverProfileResDTO })
  @CommonApiResponses()
  async getMyDriverProfile(@GetUser() user: UserPayload) {
    return this.driverProfileService.getMyDriverProfile(user.userID);
  }

  //Get driver profile by user id
  @Version('0')
  @Roles(UserRole.ADMIN)
  @Get('/:id')
  @ApiTags('Driver Profile')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: GetDriverProfileResDTO })
  @CommonApiResponses()
  async getDriverProfile(
    @Param('id') id: string,
    @GetUser() user: UserPayload,
  ) {
    return this.driverProfileService.getDriverProfile(id, user);
  }

  //Get driver profiles
  @Version('0')
  @Get('')
  @ApiTags('Driver Profile')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: GetDriverProfilesResDTO })
  @CommonApiResponses()
  async getDriverProfiles() {
    return this.driverProfileService.getDriverProfiles();
  }

  //Update driver profile
  @Version('0')
  @Put('/:id')
  @ApiTags('Driver Profile')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiBody({ type: UpdateDriverProfileSwaggerReqDTO })
  @ApiResponse({ status: HttpStatus.OK, type: UpdateDriverProfileResDTO })
  @CommonApiResponses()
  async updateDriverProfile(
    @Body() dto: UpdateDriverProfileReqDTO,
    @GetUser() user: UserPayload,
    @Param('id') id: string,
  ) {
    return this.driverProfileService.updateDriverProfile(dto, user, id);
  }

  // Update driver profile status
  @Version('0')
  @Patch('/status/:id')
  @ApiTags('Driver Profile')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiBody({ type: UpdateDriverProfileStatusSwaggerReqDTO })
  @ApiResponse({ status: HttpStatus.OK, type: UpdateDriverProfileStatusResDTO })
  @CommonApiResponses()
  async updateDriverProfileStatus(
    @Body() dto: UpdateDriverProfileStatusReqDTO,
    @Param('id') id: string,
  ) {
    return this.driverProfileService.updateDriverProfileStatus(dto, id);
  }

  // Update driver availability status
  @Version('0')
  @Roles(UserRole.DRIVER)
  @Patch('/availabilityStatus')
  @ApiTags('Driver Profile')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiBody({ type: UpdateDriverAvailabilityStatusSwaggerReqDTO })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateDriverAvailabilityStatusResDTO,
  })
  @CommonApiResponses()
  async updateDriverAvailabilityStatus(
    @Body() dto: UpdateDriverAvailabilityStatusReqDTO,
    @GetUser() user: UserPayload,
  ) {
    return this.driverProfileService.updateDriverAvailabilityStatus(dto, user);
  }

  // Delete driver profile
  @Version('0')
  @Delete('/:id')
  @ApiTags('Driver Profile')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: DeleteDriverProfileResDTO })
  @CommonApiResponses()
  @ApiOperation({
    deprecated: true,
    summary:
      ' This url is deprecated and will be removed in future, use DELETE /api/driver/ instead',
  })
  async deleteDriverProfileByUser(@GetUser() user: UserPayload) {
    return this.driverProfileService.deleteDriverProfileByUser(user);
  }


  // Update driver profile verification status
  @Version('0')
  @Roles(UserRole.ADMIN)
  @Patch('/verification-status/:id')
  @ApiTags('Driver Profile')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiBody({ type: UpdateDriverProfileVerificationStatusSwaggerReqDTO })
  @ApiResponse({ status: HttpStatus.OK, type: UpdateDriverProfileVerificationStatusResDTO })
  @CommonApiResponses()
  async updateDriverProfileVerificationStatus(
    @Body() dto: UpdateDriverProfileVerificationStatusReqDTO,
    @Param('id') id: string,
  ) {
    return this.driverProfileService.updateDriverProfileVerificationStatus(dto, id);
  }

  // Update driver profile verification status
  @Version('0')
  @Roles(UserRole.ADMIN)
  @Get('/pending/count')
  @ApiTags('Driver Profile')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: GetPendingDriverProfilesCountResDTO })
  @CommonApiResponses()
  async getPendingProfilesCount(
  ) {
    return this.driverProfileService.getPendingProfilesCount();
  }

  /**
   * Search Driver profile API
   */
  @Version('0')
  @Post('/search')
  @ApiTags('Driver Profile')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiBody({ type: ServiceDriverProfileSwaggerReqDTO })
  @ApiResponse({ status: HttpStatus.OK, type: ServiceDriverProfileResDTO })
  @CommonApiResponses()
  async searchDriverProfile(@Body() dto: SearchDriverProfileReqDTO) {
    return this.driverProfileService.searchDriverProfile(dto);
  }
}
