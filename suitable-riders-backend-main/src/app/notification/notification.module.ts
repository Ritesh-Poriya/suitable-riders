import { forwardRef, Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceModule } from '../device/device.module';
import { JobModule } from '../job/job.module';
import { Notification, NotificationSchema } from './entity/notification.entity';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    DeviceModule,
    forwardRef(() => JobModule),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, Logger],
  exports: [NotificationService],
})
export class NotificationModule {}
