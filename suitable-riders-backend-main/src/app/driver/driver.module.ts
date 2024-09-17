import { Logger, Module } from '@nestjs/common';
import { AdminSettingModule } from '../admin-settings/admin-settings.module';
import { DriverProfileModule } from '../driver-profile/driver-profile.module';
import { JobModule } from '../job/job.module';
import { MerchantProfileModule } from '../merchant-profile/merchant-profile.module';
import { SaveUserLocationModule } from '../save-user-location/save-user-location.module';
import { UsersCoreModule } from '../users/users-core.module';
import { DriverService } from './driver.service';
import { DriverController } from './drivers.controller';

@Module({
  imports: [
    AdminSettingModule,
    SaveUserLocationModule,
    MerchantProfileModule,
    JobModule,
    DriverProfileModule,
    UsersCoreModule,
  ],
  providers: [DriverService, Logger],
  controllers: [DriverController],
  exports: [DriverService],
})
export class DriverModule {}
