import { Global, Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { MailerConfig } from './@types/MailerConfig';
import { EmailService } from './email.service';
import { EmailTransport } from './mail-transporter';
import { MAILER_EJS_CONSUMER, MAILER_TRANSPORT } from './constants';
import { EJSModule } from '../ejs/ejs.module';

@Global()
@Module({})
export class MailerCoreModule {
  static forRoot(options: MailerConfig) {
    const mailerTransportProvider = {
      provide: MAILER_TRANSPORT,
      useFactory: () => new EmailTransport(options.transportConfig),
    };
    return {
      module: MailerCoreModule,
      imports: [
        CommonModule,
        EJSModule.forFeature({
          consumer: MAILER_EJS_CONSUMER,
          templatePath: options.templateFolderPath,
        }),
      ],
      providers: [mailerTransportProvider, EmailService],
      exports: [EmailService],
    };
  }
}
