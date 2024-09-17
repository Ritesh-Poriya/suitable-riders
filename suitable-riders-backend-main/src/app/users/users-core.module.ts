import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserSettings,
  UserSettingsSchema,
} from './entity/user-settings.entity';
import { User, UserSchema } from './entity/user.entity';
import { ParseUserRolePipe } from './pipes/ParseUserRolePipe';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserSettings.name, schema: UserSettingsSchema },
    ]),
  ],
  providers: [UsersService, ParseUserRolePipe, Logger],
  exports: [UsersService, ParseUserRolePipe],
})
export class UsersCoreModule {}
