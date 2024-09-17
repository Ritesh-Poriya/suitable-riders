import { Logger, Module } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AutoIncrementFieldType } from '../common/@types/auto-increment-field';
import { autoIncrementPlugin } from '../common/utils/auto-increment.plugin';
import {
  SubscriptionTransactions,
  SubscriptionTransactionsSchema,
} from './entity/subscription-transactions.entity';
import { SubscriptionTransactionsController } from './subscription-transactions.controller';
import { SubscriptionTransactionsServices } from './subscription-transactions.services';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: SubscriptionTransactions.name,
        useFactory: async (connection: Connection) => {
          const schema = SubscriptionTransactionsSchema;
          const plugIn = await autoIncrementPlugin(connection, {
            fieldName: 'transactionID',
            collectionName: 'subscriptiontransactions',
            start: 100000,
            prefix: '',
            suffix: '',
            incrementBy: 1,
            fieldType: AutoIncrementFieldType.String,
          });
          schema.plugin(plugIn);
          return schema;
        },
        inject: [getConnectionToken()],
      },
    ]),
  ],
  controllers: [SubscriptionTransactionsController],
  providers: [SubscriptionTransactionsServices, Logger],
  exports: [SubscriptionTransactionsServices],
})

/**
 * subscription module
 */
export class SubscriptionTransactionsModule {}
