import Stripe from 'stripe';

export interface StripeCoreModuleRegisterOptions {
  apiKey: string;
  webHookEndpointSecret?: string;
  config: Stripe.StripeConfig;
}
