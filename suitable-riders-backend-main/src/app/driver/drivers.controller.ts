import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Version,
} from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommonApiResponses } from '../common/decorators/common-sagger.decorator';
import { GetUser } from '../common/decorators/user-param.decorator';
import { UserPayload } from '../jwt/@types/user-payload.interface';
import { DriverService } from './driver.service';
import { DeleteDriverResDTO } from './dto/delete-driver.dto';
import { GetNearByDriversCountResDTO } from './dto/get-near-by-drivers.dto';

@Controller({ path: 'api/drivers', version: ['0', '1'] })
export class DriverController {
  constructor(private driverService: DriverService) {}

  @Version('0')
  @Get('/nearByDriversCount')
  @ApiTags('Driver')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: GetNearByDriversCountResDTO })
  @CommonApiResponses()
  async getNearByDriversCount(@GetUser() user: UserPayload) {
    return this.driverService.getNearByDriversCount(user);
  }

  // Delete driver by payload
  @Version('0')
  @Delete('/')
  @ApiTags('Driver')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: DeleteDriverResDTO })
  @CommonApiResponses()
  async delete(@GetUser() user: UserPayload) {
    return this.driverService.deleteDriverByUserID(user.userID);
  }

  // Delete driver by userID
  @Version('0')
  @Delete('/:userID')
  @ApiTags('Driver')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: DeleteDriverResDTO })
  @CommonApiResponses()
  async deleteDriverByUserID(@Param('userID') userID: string) {
    return this.driverService.deleteDriverByUserID(userID);
  }
}
