import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { CreateDeviceDTO } from './dto/create-device.dto';
import { Device, DeviceDocument } from './entity/device.entity';

@Injectable()
export class DeviceService {
  constructor(
    private logger: Logger,
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    private userService: UsersService,
  ) {}

  public async create(
    createDeviceDto: CreateDeviceDTO,
    userID: string,
  ): Promise<CreateDeviceDTO> {
    await this.deviceModel.updateMany(
      { deviceId: createDeviceDto.deviceId },
      { $set: { isDeleted: true } },
    );
    const device = this.deviceModel.create({
      ...createDeviceDto,
      userID: new Types.ObjectId(userID),
    });
    this.logger.log(
      `DeviceService.create() dto: ${JSON.stringify(
        createDeviceDto,
      )} userID: ${userID}`,
    );
    return device;
  }

  public async delete(deviceId: string) {
    await this.deviceModel.updateOne(
      { deviceId: deviceId, isDeleted: false },
      { $set: { isDeleted: true } },
    );
    return true;
  }

  public async getNotificationTokensFromUser(userIDs: string[]) {
    this.logger.debug(
      `DeviceService.getNotificationTokensFromUser() with userIds`,
      userIDs,
    );
    const users = await this.userService.getUserIDsWithNotificationsTurnedOn(
      userIDs,
    );
    this.logger.debug(
      'DeviceService.getNotificationTokensFromUser() with users who has notifications turned on',
      users,
    );
    const devices = await this.deviceModel.find({
      userID: { $in: users },
      isDeleted: false,
    });
    return devices.map((device: Device) => device.notificationToken);
  }
}
