import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AutoIncrementFieldType } from '../common/@types/auto-increment-field';
import { CommonModule } from '../common/common.module';
import { autoIncrementPlugin } from '../common/utils/auto-increment.plugin';
import { JobModule } from '../job/job.module';
import { MediaModule } from '../media/media.module';
import { UsersCoreModule } from '../users/users-core.module';
import { UsersService } from '../users/users.service';
import {
  MerchantProfile,
  MerchantProfileSchema,
} from './entity/merchant-profile.entity';
import { MerchantEventListener } from './listeners/merchant.listener';
import { MerchantProfileController } from './merchant-profile.controller';
import { MerchantProfileService } from './merchant-profile.service';

@Module({
  imports: [
    forwardRef(() => CommonModule),
    MediaModule,
    forwardRef(() => JobModule),
    UsersCoreModule,
    MongooseModule.forFeatureAsync([
      {
        name: MerchantProfile.name,
        useFactory: async (
          connection: Connection,
          userService: UsersService,
        ) => {
          const schema = MerchantProfileSchema;
          const plugIn = await autoIncrementPlugin(connection, {
            fieldName: 'merchantNumber',
            collectionName: 'merchantprofiles',
            start: 10000,
            prefix: '',
            suffix: '',
            incrementBy: 1,
            fieldType: AutoIncrementFieldType.String,
          });
          schema.plugin(plugIn);
          const plugIn2 = await autoIncrementPlugin(connection, {
            fieldName: 'businessID',
            collectionName: 'merchantprofiles',
            start: 1000,
            prefix: '',
            suffix: '',
            incrementBy: 1,
            fieldType: AutoIncrementFieldType.String,
          });
          schema.plugin(plugIn2);
          schema.post('save', function (doc) {
            userService.updateProfileImage(
              doc.ownerID,
              doc.businessInfo?.profileImage,
            );
          });
          return schema;
        },
        inject: [getConnectionToken(), UsersService],
        imports: [UsersCoreModule],
      },
    ]),
    HttpModule,
  ],
  controllers: [MerchantProfileController],
  providers: [MerchantProfileService, MerchantEventListener],
  exports: [MerchantProfileService],
})
export class MerchantProfileModule {}
