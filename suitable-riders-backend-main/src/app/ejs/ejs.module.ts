import { DynamicModule, Module } from '@nestjs/common';
import { MessageBuilder } from './message-builder';
import { EJSOptions } from './@types/EJSOptions';

@Module({})
export class EJSModule {
  static forFeature(options: EJSOptions): DynamicModule {
    const ejsProvider = {
      provide: options.consumer,
      useFactory: () => {
        return new MessageBuilder(options.templatePath, options.ejsOptions);
      },
    };
    return {
      module: EJSModule,
      providers: [ejsProvider],
      exports: [ejsProvider],
    };
  }
}
