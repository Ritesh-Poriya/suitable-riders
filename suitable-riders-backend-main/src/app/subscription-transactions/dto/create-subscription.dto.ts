import { PickType } from '@nestjs/swagger';
import { SubscriptionTransactions } from '../entity/subscription-transactions.entity';

/**
 * create subscription DTO
 */
export class CreateSubscriptionTransactionReqDTO extends PickType(
  SubscriptionTransactions,
  [
    'merchantName',
    'transactionDate',
    'subscriptionMonth',
    'amount',
    'paymentMode',
    'transactionNotes',
    'merchantProfileID',
  ],
) {}
export class CreateSubscriptionTransactionResDTO extends SubscriptionTransactions {}
