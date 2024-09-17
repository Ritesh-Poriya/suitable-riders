import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { WebHookOptions } from './@types/WebHookOptions';
import { WEBHOOK_URL_CONSUMER, WEBHOOK_AUTH_TOKEN_CONSUMER } from './constants';
import { WebHookService } from './webhook.service';
import { WebHookEventListener } from './listeners/webhook.listener';
import { CommonModule } from '../common/common.module';

@Global()
@Module({})
export class WebHookModule {
  static register(options: WebHookOptions): DynamicModule {
    return {
      module: WebHookModule,
      imports: [HttpModule, CommonModule],
      providers: [
        { provide: WEBHOOK_URL_CONSUMER, useValue: options.url },
        { provide: WEBHOOK_AUTH_TOKEN_CONSUMER, useValue: options.auth_token },
        WebHookService,
        WebHookEventListener,
      ],
      exports: [WebHookService],
    };
  }
}
