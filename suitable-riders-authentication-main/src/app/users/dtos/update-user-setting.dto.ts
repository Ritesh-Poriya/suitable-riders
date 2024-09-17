import { PickType } from '@nestjs/swagger';
import { UserSettings } from '../entity/user-settings.entity';

export class UpdateUserSettingsReqDTO extends PickType(UserSettings, [
  'pushNotification',
]) {}

export class UpdateUserSettingsResDTO extends UserSettings {}
