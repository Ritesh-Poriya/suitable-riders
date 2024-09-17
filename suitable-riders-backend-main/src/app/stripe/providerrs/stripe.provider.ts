import Stripe from 'stripe';
export const stripeProvider = (
  apiKey: string,
  config: Stripe.StripeConfig,
): Stripe => {
  return new Stripe(apiKey, config);
};
