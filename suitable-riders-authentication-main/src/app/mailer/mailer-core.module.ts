import { Global, Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { MailerConfig } from './@types/ITransportConfig';
import { EmailService } from './email.service';
import { EmailTransport } from './mail-transporter';
import { MAILER_TRANSPORT, MESSAGE_BUILDER } from './mailer.constants';
import { MessageBuilder } from './message-builder';

@Global()
@Module({})
export class MailerCoreModule {
  static forRoot(options: MailerConfig) {
    const mailerTransportProvider = {
      provide: MAILER_TRANSPORT,
      useFactory: () => new EmailTransport(options.transportConfig),
    };
    const messageBuilderProvider = {
      provide: MESSAGE_BUILDER,
      useFactory: () => new MessageBuilder(options.templateFolderPath),
    };
    return {
      module: MailerCoreModule,
      imports: [CommonModule],
      providers: [
        mailerTransportProvider,
        messageBuilderProvider,
        EmailService,
      ],
      exports: [EmailService],
    };
  }
}
