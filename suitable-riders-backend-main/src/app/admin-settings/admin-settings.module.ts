import { forwardRef, Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MerchantProfileModule } from '../merchant-profile/merchant-profile.module';
import { UsersCoreModule } from '../users/users-core.module';
import { AdminSettingController } from './admin-settings.controller';
import { AdminSettingServices } from './admin-settings.service';
import {
  AdminSetting,
  AdminSettingsSchema,
} from './entity/admin-settings.entity';
import { AdminSettingsEventListener } from './listeners/admin-settings.listener';

@Module({
  imports: [
    forwardRef(() => UsersCoreModule),
    forwardRef(() => MerchantProfileModule),
    MongooseModule.forFeature([
      { name: AdminSetting.name, schema: AdminSettingsSchema },
    ]),
  ],
  controllers: [AdminSettingController],
  providers: [AdminSettingServices, AdminSettingsEventListener, Logger],
  exports: [AdminSettingServices],
})
/**
 * Admin setting module
 */
export class AdminSettingModule {}
