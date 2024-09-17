import { DynamicModule, Logger, Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { StripeOptions } from './@types/stripe-options';
import { CommonModule } from '../common/common.module';
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_ENDPOINT_SECRET } from './constants';
import { UsersCoreModule } from '../users/users-core.module';
import { StripeCoreModule } from './stripe.core.module';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import {
  DriverProfile,
  DriverProfileSchema,
} from '../driver-profile/entity/driver-profile.entity';
import { Connection } from 'mongoose';
import { UsersService } from '../users/users.service';
import { autoIncrementPlugin } from '../common/utils/auto-increment.plugin';
import { AutoIncrementFieldType } from '../common/@types/auto-increment-field';

@Module({})
export class StripeModule {
  static register(options: StripeOptions): DynamicModule {
    return {
      module: StripeModule,
      imports: [
        UsersCoreModule,
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
        StripeCoreModule.forRoot({
          apiKey: options.secret_key,
          webHookEndpointSecret: options.webhook_secret,
          config: {
            apiVersion: '2023-10-16',
          },
        }),
        CommonModule,
      ],
      controllers: [StripeController],
      providers: [
        StripeService,
        { provide: STRIPE_SECRET_KEY, useValue: options.secret_key },
        {
          provide: STRIPE_WEBHOOK_ENDPOINT_SECRET,
          useValue: options.webhook_secret,
        },
        Logger,
      ],
      exports: [StripeService],
    };
  }
}
