import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from 'src/app/mailer/email.service';
import { UserDocument } from 'src/app/users/entity/user.entity';
import { AuthEventType } from '../@types/auth-event-types';

@Injectable()
export class AuthEventListener {
  constructor(private emailService: EmailService) {}

  // @OnEvent(AuthEventType.DRIVER_REGISTERED)
  // private handleDriverRegistered(user: UserDocument) {
  // }

  @OnEvent(AuthEventType.MERCHANT_REGISTERED)
  private handleMerchantRegistered(user: UserDocument) {
    this.emailService.sendMerchantRegisteredMail(user.email, {
      username: user.username,
    });
  }
}
