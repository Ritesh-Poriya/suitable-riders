import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersCoreModule } from '../users/users-core.module';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { Device, DeviceSchema } from './entity/device.entity';

@Module({
  controllers: [DeviceController],
  imports: [
    MongooseModule.forFeature([
      {
        name: Device.name,
        schema: DeviceSchema,
      },
    ]),
    UsersCoreModule,
  ],
  providers: [DeviceService, Logger],
  exports: [DeviceService],
})
export class DeviceModule {}
