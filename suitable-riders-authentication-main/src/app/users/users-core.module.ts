import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from '../common/common.module';
import { OTPModule } from '../otp/otp.module';
import {
  UserSettings,
  UserSettingsSchema,
} from './entity/user-settings.entity';
import { User, UserSchema } from './entity/user.entity';
import { ParseUserRolePipe } from './pipes/ParseUserRolePipe';
import { UsersService } from './users.service';

@Module({
  imports: [
    CommonModule,
    OTPModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserSettings.name, schema: UserSettingsSchema },
    ]),
  ],
  providers: [UsersService, ParseUserRolePipe],
  exports: [UsersService, ParseUserRolePipe],
})
export class UsersCoreModule {}
