import { forwardRef, Logger, Module } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AutoIncrementFieldType } from '../common/@types/auto-increment-field';
import { autoIncrementPlugin } from '../common/utils/auto-increment.plugin';
import { JobModule } from '../job/job.module';
import { MediaModule } from '../media/media.module';
import { Vehicle, VehicleSchema } from './entity/vehicle.entity';
import { VehicleEventListener } from './listeners/vehicle.listener';
import { VehicleController } from './vehicle-controller';
import { VehicleService } from './vehicle.service';
import { DriverProfile, DriverProfileSchema } from '../driver-profile/entity/driver-profile.entity';
import { UsersService } from '../users/users.service';
import { UsersCoreModule } from '../users/users-core.module';

@Module({
  imports: [
    MediaModule,
    UsersCoreModule,
    forwardRef(() => JobModule),
    MongooseModule.forFeatureAsync([
      {
        name: Vehicle.name,
        useFactory: async (connection: Connection) => {
          const schema = VehicleSchema;
          const plugIn = await autoIncrementPlugin(connection, {
            fieldName: 'vehicleNumber',
            collectionName: 'vehicles',
            start: 100056,
            prefix: '',
            suffix: '',
            incrementBy: 1,
            fieldType: AutoIncrementFieldType.String,
          });
          schema.plugin(plugIn);
          return schema;
        },
        inject: [getConnectionToken()],
      },
    ]),
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
  controllers: [VehicleController],
  providers: [VehicleService, VehicleEventListener, Logger],
  exports: [VehicleService],
})
export class VehicleModule {}
