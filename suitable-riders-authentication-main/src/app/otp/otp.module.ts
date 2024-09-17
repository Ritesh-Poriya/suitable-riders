import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { MailerModule } from '../mailer/mailer.module';
import { RedisModule } from '../redis/redis.module';
import { OTPEventsListener } from './listeners/signup-events.listener';
import { OTPRequestFactory } from './otp-request.factory';
import { OTPService } from './otp.service';
import { OTPProcessor } from './processor/auth.processor';

@Module({
  imports: [
    MailerModule,
    CommonModule,
    RedisModule,
    BullModule.registerQueue({
      name: 'otp',
    }),
  ],
  providers: [OTPService, OTPRequestFactory, OTPEventsListener, OTPProcessor],
  exports: [OTPService, OTPRequestFactory],
})
export class OTPModule {}
