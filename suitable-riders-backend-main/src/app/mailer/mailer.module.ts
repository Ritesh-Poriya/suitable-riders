import { Module } from '@nestjs/common';
import { MailerConfig } from './@types/MailerConfig';
import { MailerCoreModule } from './mailer-core.module';

@Module({})
export class MailerModule {
  static forRoot(options: MailerConfig) {
    return {
      module: MailerModule,
      imports: [MailerCoreModule.forRoot(options)],
    };
  }
}
