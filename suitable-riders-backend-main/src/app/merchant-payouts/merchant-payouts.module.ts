import { Module } from '@nestjs/common';
import { MerchantPayoutsService } from './merchant-payouts.service';
import { MerchantPayoutsController } from './merchant-payouts.controller';
import { MerchantPayoutsEventListener } from './listeners/merchant-payouts.listener';
import { CommonModule } from '../common/common.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MerchantBalance,
  MerchantBalanceSchema,
} from './entity/merchant-balance.entity';
import {
  MerchantPayable,
  MerchantPayableSchema,
} from './entity/merchant-payable.entity';
import {
  MerchantPayout,
  MerchantPayoutSchema,
} from './entity/merchant-payout.entity';
import { UsersCoreModule } from '../users/users-core.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MerchantBalance.name, schema: MerchantBalanceSchema },
      { name: MerchantPayable.name, schema: MerchantPayableSchema },
      { name: MerchantPayout.name, schema: MerchantPayoutSchema },
    ]),
    UsersCoreModule,
    CommonModule,
  ],
  controllers: [MerchantPayoutsController],
  providers: [MerchantPayoutsService, MerchantPayoutsEventListener],
  exports: [MerchantPayoutsService],
})
export class MerchantPayoutsModule {}
