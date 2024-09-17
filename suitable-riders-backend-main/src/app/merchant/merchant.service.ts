import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import moment from 'moment';
import { CustomErrorCodes } from '../common/@types/custom-error-codes';
import { EventTypes } from '../common/@types/eventType';
import { CustomHTTPException } from '../common/errors/custom.exception';
import { JobService } from '../job/job.service';
import { EmailService } from '../mailer/email.service';
import { MerchantProfileService } from '../merchant-profile/merchant-profile.service';
import { UsersService } from '../users/users.service';
import { SendSubscriptionEmailReqDTO } from './dto/subscription-missed-email.dto';

@Injectable()
export class MerchantService {
  constructor(
    private userService: UsersService,
    private jobService: JobService,
    private eventEmitter: EventEmitter2,
    private merchantProfileService: MerchantProfileService,
    private emailService: EmailService,
    private logger: Logger,
  ) {}

  public async deleteMerchantByUserID(userID: string) {
    this.logger.debug(
      `MerchantService.deleteMerchantByUserID() userID: ${userID}`,
    );
    const merchant =
      await this.merchantProfileService.getMerchantProfileByUserID(userID);
    if (!merchant) {
      throw new CustomHTTPException(
        {
          key: 'errors.NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.MERCHANT_PROFILE_NOT_FOUND,
      );
    }
    const activeJobs = await this.jobService.getActiveJobsForMerchantByUserId(
      userID,
    );
    if (activeJobs.length > 0) {
      throw new CustomHTTPException(
        {
          key: 'errors.CANNOT_DELETE_MERCHANT_WITH_ACTIVE_JOBS',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.CANNOT_DELETE_MERCHANT_WITH_ACTIVE_JOBS,
      );
    }

    await this.merchantProfileService.deleteMerchantProfile(userID);
    await this.userService.deleteUserByID(userID);
    this.eventEmitter.emit(EventTypes.MerchantDeleted, {
      userID: userID,
    });
    return {
      deleted: true,
    };
  }

  public async sendSubscriptionMissedEmail(
    userID: string,
    dto: SendSubscriptionEmailReqDTO,
  ) {
    this.logger.debug(
      `MerchantService.sendSubscriptionMissedEmail() userID: ${userID} - dto: ${JSON.stringify(
        dto,
      )}`,
    );
    const merchant =
      await this.merchantProfileService.getMerchantProfileByUserID(userID);
    if (!merchant) {
      throw new CustomHTTPException(
        {
          key: 'errors.NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.MERCHANT_PROFILE_NOT_FOUND,
      );
    }
    const user = await this.userService.findOneById(userID);
    this.emailService.subscriptionMissed(user.email, {
      merchantBusinessName: merchant.businessInfo.businessName,
      month: moment(dto.subscriptionDate).format('MMMM'),
    });
    return true;
  }
}
