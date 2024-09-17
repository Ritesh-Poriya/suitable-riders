import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommonApiResponses } from '../common/decorators/common-sagger.decorator';
import { GetUser } from '../common/decorators/user-param.decorator';
import { UserPayload } from '../jwt/@types/user-payload.interface';
import { DeviceService } from './device.service';
import { CreateDeviceDTO, CreateDeviceResDTO } from './dto/create-device.dto';
import { deleteDeviceResDTO } from './dto/delete-device.dto';

@Controller('api/device')
export class DeviceController {
  constructor(private deviceService: DeviceService) {}

  // Create device
  @Post('/')
  @ApiTags('Device')
  @ApiResponse({ status: HttpStatus.CREATED, type: CreateDeviceResDTO })
  @CommonApiResponses()
  async create(
    @Body() createDeviceDto: CreateDeviceDTO,
    @GetUser() user: UserPayload,
  ): Promise<CreateDeviceDTO> {
    return this.deviceService.create(createDeviceDto, user.userID);
  }

  // Delete device
  @Delete('/:deviceId')
  @ApiTags('Device')
  @ApiResponse({ status: HttpStatus.OK, type: deleteDeviceResDTO })
  @CommonApiResponses()
  async delete(@Param('deviceId') deviceId: string) {
    return this.deviceService.delete(deviceId);
  }
}
