import { Inject } from '@nestjs/common';
import { STRIPE_WEBHOOK_ENDPOINT_SECRET } from '../constants';

export const InjectStripeWebHookSecret = () =>
  Inject(STRIPE_WEBHOOK_ENDPOINT_SECRET);
