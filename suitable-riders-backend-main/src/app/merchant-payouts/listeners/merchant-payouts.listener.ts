import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MerchantPayoutEventType } from '../@types/merchant-payouts-event-type';
import { MerchantPayoutsService } from '../merchant-payouts.service';

@Injectable()
export class MerchantPayoutsEventListener {
  constructor(private merchantPayoutsService: MerchantPayoutsService) {}

  @OnEvent(MerchantPayoutEventType.JOB_COMPLETED)
  async handleEventJobComplete(
    merchantID: string,
    isFromOutsideRiders?: boolean,
  ) {
    if (!isFromOutsideRiders) {
      this.merchantPayoutsService.incrementJobCompleteCount(merchantID);
    }
  }
}
