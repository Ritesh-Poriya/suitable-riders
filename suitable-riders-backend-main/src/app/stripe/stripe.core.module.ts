import { DynamicModule, Module } from '@nestjs/common';
import { StripeCoreModuleRegisterOptions } from './@types/StripeCoreModuleRegisterOptions';
import { STRIPE } from './constants';
import { stripeProvider } from './providerrs/stripe.provider';

@Module({})
export class StripeCoreModule {
  static forRoot(options: StripeCoreModuleRegisterOptions): DynamicModule {
    const stripeProviders = [
      {
        provide: STRIPE,
        useValue: stripeProvider(options.apiKey, options.config),
      },
    ];
    return {
      module: StripeCoreModule,
      providers: stripeProviders,
      exports: stripeProviders,
    };
  }
}
