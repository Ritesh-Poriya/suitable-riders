import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { environment } from 'src/environments';
import { IEnvironmentVariables } from '../common/@types/IEnvironmentVariables';
import { EmailTransport } from './mail-transporter';
import { MAILER_TRANSPORT, MESSAGE_BUILDER } from './mailer.constants';
import { MessageBuilder } from './message-builder';

@Injectable()
export class EmailService {
  constructor(
    @Inject(MAILER_TRANSPORT) private transporter: EmailTransport,
    @Inject(MESSAGE_BUILDER) private messageBuilder: MessageBuilder,
    private readonly configService: ConfigService<IEnvironmentVariables>,
    private logger: Logger,
  ) {}

  async sendOTPMail(
    toMail: string,
    localData: {
      data: {
        action: string;
        otp: string;
      };
    },
  ) {
    return this.sendMailToWithTemplate({
      toMail,
      template: 'sendOTP.ejs',
      fromMail: '"Suitable Riders"<no-reply@suitableriders.com>',
      subject: `${localData.data.otp} is the OTP to verify your email for Suitable Riders`,
      localData,
    });
  }

  async sendMerchantRegisteredMail(
    toMail: string,
    localData: {
      username: string;
    },
  ) {
    return this.sendMailToWithTemplate({
      template: 'merchant-register.ejs',
      fromMail: '"Suitable Riders"<no-reply@suitableriders.com>',
      toMail: toMail,
      subject: 'Welcome to Suitable Riders',
      localData,
    });
  }

  private async sendMailToWithTemplate(
    attrs: {
      toMail: string;
      fromMail: string;
      subject: string;
      template: string;
      localData: any;
      cc?: string[];
      attachment?: { fileName: string; path: string };
    },
    callbacks?: {
      onComplete?: (info: any) => void;
      onError?: (error: any) => void;
    },
  ) {
    try {
      const data = await this.messageBuilder.getDataFromTemplate(
        attrs.template,
        {
          ...attrs.localData,
          SRLogo: environment.SRLogo,
          SRUrl: environment.SRUrl,
        },
      );
      const env =
        this.configService.get('NODE_ENV') === 'prod'
          ? ''
          : `${this.configService.get('NODE_ENV')}:`;
      const info = await this.transporter.send({
        from: attrs.fromMail,
        to: attrs.toMail,
        subject: `${env}${attrs.subject}`,
        cc: attrs.cc,
        html: data,
        attachments: attrs.attachment,
      });
      if (callbacks && callbacks.onComplete) {
        callbacks.onComplete(info);
      }
    } catch (error) {
      this.logger.error(error);
      if (callbacks && callbacks.onError) {
        callbacks.onError(error);
      }
    }
  }
}
