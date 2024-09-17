import { Inject, Injectable, Logger } from '@nestjs/common';
import { WEBHOOK_AUTH_TOKEN_CONSUMER, WEBHOOK_URL_CONSUMER } from './constants';
import { WebHookBody } from './@types/WebHookBody';
import axios from 'axios';

@Injectable()
export class WebHookService {
  constructor(
    @Inject(WEBHOOK_URL_CONSUMER) private webhook_url: string,
    @Inject(WEBHOOK_AUTH_TOKEN_CONSUMER) private webhook_auth_token: string,
    private logger: Logger,
  ) {}

  async triggerEvent(body: WebHookBody) {
    this.logger.debug(`WebHookService.triggerEvent(): body ${body}`);

    const data = await axios.post(this.webhook_url, body, {
      headers: {
        authorization: `Bearer ${this.webhook_auth_token}`,
      },
    });
    this.logger.debug(`WebHookService.triggerEvent() Response: data${data}`);
    return data;
  }
}
