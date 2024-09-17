import { Logger, Module } from '@nestjs/common';
import { AdminSettingModule } from '../admin-settings/admin-settings.module';
import { JobModule } from '../job/job.module';
import { MerchantProfileModule } from '../merchant-profile/merchant-profile.module';
import { MerchantController } from '../merchant/merchant.controller';
import { UsersCoreModule } from '../users/users-core.module';
import { MerchantService } from './merchant.service';
// import { MonthlySubscriptionEmailService } from './scheduled-tasks/monthly-subscription-email.cron.service';

@Module({
  imports: [
    UsersCoreModule,
    JobModule,
    MerchantProfileModule,
    AdminSettingModule,
  ],
  controllers: [MerchantController],
  providers: [MerchantService, Logger],
  // MonthlySubscriptionEmailService
  exports: [MerchantService],
})
export class MerchantModule {}
