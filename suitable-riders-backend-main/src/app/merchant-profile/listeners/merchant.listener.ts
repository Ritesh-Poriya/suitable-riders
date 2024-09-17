import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { EmailService } from 'src/app/mailer/email.service';
import { UsersService } from 'src/app/users/users.service';
import { MerchantEventType } from '../@types/merchant-event-type';
import { MerchantProfileService } from '../merchant-profile.service';

@Injectable()
export class MerchantEventListener {
  constructor(
    private merchantProfileService: MerchantProfileService,
    private emailService: EmailService,
    private usersService: UsersService,
  ) {}

  @OnEvent(MerchantEventType.SUCCESSFULLY_APPLIED_FOR_MERCHANT_ENROLLMENT)
  public async handleSuccessfullyAppliedForMerchantEnrollment(
    merchantID: Types.ObjectId,
  ) {
    const merchant = await this.merchantProfileService.findMerchantByUserId(
      merchantID,
    );
    const user = await this.usersService.findOneById(String(merchantID));

    this.emailService.successfullyAppliedForMerchantEnrolment(user.email, {
      merchantName: user.username,
      merchantNumber: merchant.merchantNumber,
    });
  }

  @OnEvent(MerchantEventType.MERCHANT_ACCOUNT_APPROVED)
  public async handleMerchantAccountApproved(merchantID: Types.ObjectId) {
    const user = await this.usersService.findOneById(String(merchantID));
    this.emailService.merchantAccountApproved(user.email, {
      merchantName: user.username,
    });
    this.emailService.emailForPOSDispatch(user.email, {
      merchantName: user.username,
    });
  }

  @OnEvent(MerchantEventType.MERCHANT_VERIFICATION_FAILED)
  public async handleMerchantVerificationFailed(merchantID: Types.ObjectId) {
    const merchant = await this.merchantProfileService.findMerchantByUserId(
      merchantID,
    );
    const user = await this.usersService.findOneById(String(merchantID));
    this.emailService.verificationProcessFailed(user.email, {
      merchantName: user.username,
      message: merchant.rejectionReason,
    });
  }
}
