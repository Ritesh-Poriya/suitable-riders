import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Global, Logger, Module } from '@nestjs/common';
import { SMSOptions } from './@types/sms-options';
import { SMS_SERVICES_OPTION } from './constants';
import { SMSServices } from './sms.service';
/**
 * SMS Module
 */
@Global()
@Module({})
export class SMSModule {
  static forRoot(options: SMSOptions): DynamicModule {
    return {
      module: SMSModule,
      imports: [HttpModule],
      exports: [SMSServices],
      providers: [
        SMSServices,
        {
          provide: SMS_SERVICES_OPTION,
          useValue: options,
        },
        Logger,
      ],
    };
  }
}
