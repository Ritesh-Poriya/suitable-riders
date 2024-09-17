import { Module } from '@nestjs/common';
import { DriverProfileModule } from '../driver-profile/driver-profile.module';
import { JobModule } from '../job/job.module';
import { SubscriptionTransactionsModule } from '../subscription-transactions/subscription-transactions.module';
import { UsersCoreModule } from '../users/users-core.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.services';
import { MerchantPayoutsModule } from '../merchant-payouts/merchant-payouts.module';

@Module({
  imports: [
    UsersCoreModule,
    JobModule,
    SubscriptionTransactionsModule,
    DriverProfileModule,
    MerchantPayoutsModule,
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
  exports: [DashboardService],
})
export class DashboardModule {}
