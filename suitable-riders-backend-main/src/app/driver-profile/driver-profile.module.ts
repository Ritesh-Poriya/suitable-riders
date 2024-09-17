import { forwardRef, Logger, Module } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AdminSettingModule } from '../admin-settings/admin-settings.module';
import { AutoIncrementFieldType } from '../common/@types/auto-increment-field';
import { autoIncrementPlugin } from '../common/utils/auto-increment.plugin';
import { JobModule } from '../job/job.module';
import { MediaModule } from '../media/media.module';
import { UsersCoreModule } from '../users/users-core.module';
import { UsersService } from '../users/users.service';
import { VehicleModule } from '../vehicle/vehicle.module';
import { DriverProfileController } from './driver-profile.controller';
import { DriverProfileService } from './driver-profile.service';
import {
  DriverProfile,
  DriverProfileSchema,
} from './entity/driver-profile.entity';
import { DriverProfileEventListener } from './listeners/driver-profile.listener';
import { DriverProfileUnAvailableCronService } from './scheduled-tasks/driver-unavailable-cron.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MediaModule,
    UsersCoreModule,
    VehicleModule,
    forwardRef(() => NotificationModule),
    forwardRef(() => AdminSettingModule),
    forwardRef(() => JobModule),
    MongooseModule.forFeatureAsync([
      {
        name: DriverProfile.name,
        useFactory: async (
          connection: Connection,
          userService: UsersService,
        ) => {
          const schema = DriverProfileSchema;
          const plugIn = await autoIncrementPlugin(connection, {
            fieldName: 'driverNumber',
            collectionName: 'driverprofiles',
            start: 100000,
            prefix: '',
            suffix: '',
            incrementBy: 1,
            fieldType: AutoIncrementFieldType.String,
          });
          schema.plugin(plugIn);
          schema.post('save', function (doc) {
            userService.updateProfileImage(doc.ownerID, doc.profileImage);
          });
          return schema;
        },
        inject: [getConnectionToken(), UsersService],
        imports: [UsersCoreModule],
      },
    ]),
  ],
  controllers: [DriverProfileController],
  providers: [
    DriverProfileService,
    DriverProfileUnAvailableCronService,
    DriverProfileEventListener,
    Logger,
  ],
  exports: [DriverProfileService],
})
export class DriverProfileModule {}
