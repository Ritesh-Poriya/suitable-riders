import { PickType } from '@nestjs/mapped-types';
import { MerchantPayout } from '../entity/merchant-payout.entity';
import { PickType as PickTypeSwagger } from '@nestjs/swagger';

export class createMerchantPayoutReqDto extends PickType(MerchantPayout, [
  'merchantID',
  'amount',
  'note',
  'paymentDate',
]) {}

export class createMerchantPayoutReqSwaggerDto extends PickTypeSwagger(
  MerchantPayout,
  ['merchantID', 'amount', 'note', 'paymentDate'],
) {}
