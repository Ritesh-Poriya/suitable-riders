import { PickType } from '@nestjs/swagger';
import { Device } from '../entity/device.entity';

export class CreateDeviceDTO extends PickType(Device, [
  'deviceId',
  'deviceType',
  'notificationToken',
  'deviceOS',
  'deviceAppVersion',
  'deviceModel',
  'deviceManufacturer',
]) {}

export class CreateDeviceResDTO extends Device {}
