import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from '../../mailer/email.service';
import { SignupSendOTPRequestToListener } from '../@types/send-otp-listener-data';

@Injectable()
export class OTPEventsListener {
  constructor(private emailService: EmailService) {}
  @OnEvent('sendOTP')
  handleSignupRequestEvent(data: SignupSendOTPRequestToListener) {
    this.emailService.sendOTPMail(data.email, {
      data: {
        action: data.action,
        otp: data.otp,
      },
    });
  }
}
