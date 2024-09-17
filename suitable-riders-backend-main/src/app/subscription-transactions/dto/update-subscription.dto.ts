import { PickType } from '@nestjs/swagger';
import { SubscriptionTransactions } from '../entity/subscription-transactions.entity';
import { CreateSubscriptionTransactionResDTO } from './create-subscription.dto';

export class UpdateSubscriptionTransactionReqDTO extends PickType(
  SubscriptionTransactions,
  [
    'merchantName',
    'transactionDate',
    'subscriptionMonth',
    'amount',
    'transactionNotes',
    'paymentMode',
  ],
) {}

export class UpdateSubscriptionTransactionResDTO extends CreateSubscriptionTransactionResDTO {}
