import { applyDecorators, SetMetadata } from '@nestjs/common';
import { IS_SUBSCRIPTION_ACTIVE } from '../constants';
/**
 * decorator of is subscription active */
export const IsSubscriptionActive = () =>
  applyDecorators(SetMetadata(IS_SUBSCRIPTION_ACTIVE, true));
