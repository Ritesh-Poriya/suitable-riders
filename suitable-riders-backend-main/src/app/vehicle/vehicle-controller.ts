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
import { ApiBody, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommonApiResponses } from '../common/decorators/common-sagger.decorator';
import { GetUser } from '../common/decorators/user-param.decorator';
import { UserPayload } from '../jwt/@types/user-payload.interface';
import {
  CreateVehicleReqDTO,
  CreateVehicleReqSwaggerDTO,
} from './dtos/create-vehicle.dto';
import { DeleteVehicleResDTO } from './dtos/delete-vehicle.dto';
import {
  GetMyVehicleReqDTO,
  GetMyVehicleResDTO,
} from './dtos/get-my-vehicles.dto';
import { GetVehicleResDTO } from './dtos/get-vehicle.dto';
import {
  SearchVehicleReqDTO,
  SearchVehicleResDTO,
} from './dtos/search-vehicle.dto';
import {
  UpdateVehicleStatusReqDTO,
  UpdateVehicleStatusReqSwaggerDTO,
  UpdateVehicleStatusResDTO,
} from './dtos/update-vehicle-status.dto';
import {
  UpdateVehicleReqDTO,
  UpdateVehicleResDTO,
  UpdateVehicleSwaggerReqDTO,
} from './dtos/update-vehicle.dto';
import { VehicleService } from './vehicle.service';

@Controller({ path: 'api/vehicle', version: ['0', '1'] })
export class VehicleController {
  constructor(private vehicleService: VehicleService) {}

  // Add vehicle
  @Version('0')
  @Post('/')
  @ApiTags('Vehicle')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiBody({ type: CreateVehicleReqSwaggerDTO })
  async createVehicle(
    @Body() dto: CreateVehicleReqDTO,
    @GetUser() user: UserPayload,
  ) {
    return this.vehicleService.createVehicle(dto, user);
  }

  // Get my vehicle
  @Version('0')
  @Post('/me')
  @ApiTags('Vehicle')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: GetMyVehicleResDTO })
  @CommonApiResponses()
  async getMyVehicle(
    @Body() dto: GetMyVehicleReqDTO,
    @GetUser() user: UserPayload,
  ) {
    return this.vehicleService.getMyVehicle(dto, user.userID);
  }

  // Get  vehicle by id
  @Version('0')
  @Get('/:id')
  @ApiTags('Vehicle')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: GetVehicleResDTO })
  @CommonApiResponses()
  async getVehicle(@Param('id') id: string) {
    return this.vehicleService.getVehicle(id);
  }

  //Search vehicle
  @Version('0')
  @Post('/search')
  @ApiTags('Vehicle')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: SearchVehicleResDTO })
  @CommonApiResponses()
  async searchVehicles(@Body() dto: SearchVehicleReqDTO) {
    return this.vehicleService.searchVehicle(dto);
  }

  // Update vehicle
  @Version('0')
  @Put('/:id')
  @ApiTags('Vehicle')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiBody({ type: UpdateVehicleSwaggerReqDTO })
  @ApiResponse({ status: HttpStatus.OK, type: UpdateVehicleResDTO })
  @CommonApiResponses()
  async updateVehicle(
    @Body() dto: UpdateVehicleReqDTO,
    @GetUser() user: UserPayload,
    @Param('id') id: string,
  ) {
    return this.vehicleService.updateVehicle(dto, user, id);
  }

  // Update vehicle status
  @Version('0')
  @Patch('/status/:id')
  @ApiTags('Vehicle')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiBody({ type: UpdateVehicleStatusReqSwaggerDTO })
  @ApiResponse({ status: HttpStatus.OK, type: UpdateVehicleStatusResDTO })
  @CommonApiResponses()
  async updateVehicleStatus(
    @Body() dto: UpdateVehicleStatusReqDTO,
    @GetUser() user: UserPayload,
    @Param('id') id: string,
  ) {
    return this.vehicleService.updateVehicleStatus(dto, user, id);
  }

  // Delete vehicle
  @Version('0')
  @Delete('/:id')
  @ApiTags('Vehicle')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: DeleteVehicleResDTO })
  @CommonApiResponses()
  async deleteVehicle(@Param('id') id: string, @GetUser() user: UserPayload) {
    return this.vehicleService.deleteVehicle(id, user);
  }
}
