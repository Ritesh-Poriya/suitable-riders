import { Inject, Injectable, Logger } from '@nestjs/common';
import { SMSOptions } from './@types/sms-options';
import { SMS_SERVICES_OPTION } from './constants';
import axios from 'axios';

/**
 * SMS Services
 */
@Injectable()
export class SMSServices {
  constructor(
    @Inject(SMS_SERVICES_OPTION) private options: SMSOptions,
    private logger: Logger,
  ) {}

  public async sendSMS(phone: string, details: any) {
    this.logger.debug(
      `SmsService.sendSMS(): phone ${phone} details ${details}`,
    );
    this.logger.debug(
      `SmsService.sendSMS(): Options ${JSON.stringify(this.options)}`,
    );
    const newPhone = phone.replace(/\+/g, '');
    const data = await axios.post(
      this.options.smsSendingUrl,
      {
        to: newPhone, //Tested phone number 447423486757
        from: `${process.env.SMS_SENDER_ID}`,
        msg: details.msg,
      },
      {
        headers: {
          authorization: `Bearer ${this.options.smsAPIKey}`,
        },
      },
    );
    this.logger.debug(`SmsService.sendSMS() Response: data${data}`);
    return data;
  }
}
