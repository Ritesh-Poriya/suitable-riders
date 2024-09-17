import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { JobService } from 'src/app/job/job.service';
import { DriverProfileEventType } from '../@types/driver-profile-event-type';
import { DriverProfileService } from '../driver-profile.service';
import { UserDocument } from 'src/app/users/entity/user.entity';
import { NotificationService } from 'src/app/notification/notification.service';
import { VerificationStatus } from '../@types/driver-profile-status-types';
import { NotificationType } from 'src/app/notification/@type/notification-type.enum';
import { FCMNotificationType } from 'src/app/firebase/@types/FCMNotificationType';
import { EmailService } from 'src/app/mailer/email.service';
import { UsersService } from 'src/app/users/users.service';

@Injectable()
export class DriverProfileEventListener {
  constructor(
    private driverProfileService: DriverProfileService,
    private notificationService: NotificationService,
    private emailService: EmailService,
    private usersService: UsersService,
    private jobService: JobService,
    private logger: Logger,
  ) {}

  @OnEvent(DriverProfileEventType.UNAVAILABLE_DRIVER)
  async handleEventDriverUnavailable() {
    this.logger.log('Event: Driver unavailable');
    const driverProfiles =
      await this.driverProfileService.getDriverProfileToUnavailable();
    const driverProfileIds = [];
    for (const driverProfile of driverProfiles) {
      const runningJob = await this.jobService.getRunningJOb(
        String(driverProfile.ownerID),
      );
      if (!runningJob) {
        driverProfileIds.push(driverProfile._id);
      }
    }
    await this.driverProfileService.setDriverProfileUnavailable(
      driverProfileIds,
    );
  }

  @OnEvent(DriverProfileEventType.DRIVER_DOCS_VERIFICATION_STATUS_UPDATE)
  async handleEventDriverDocsApproved(
    user: UserDocument,
    verificationStatus: VerificationStatus,
  ) {
    const userIDs = [user._id];
    this.logger.debug(
      'DOC_VERIFICATION_STATUS_UPDATED | send Notifications to users',
      userIDs,
    );
    const notification: FCMNotificationType = {
      type: NotificationType.DOC_VERIFICATION_STATUS_UPDATED,
      details: {
        ownerID: userIDs[0],
        verificationStatus: verificationStatus,
      },
      image: '/media/images/platform/user_icon.png',
    };

    this.notificationService.sendNotificationToUsers(userIDs, notification);

    this.emailService.driverDocVerificationUpdateEmail(
      verificationStatus,
      user.email,
      {
        driverName: user.username,
      },
    );
  }

  @OnEvent(DriverProfileEventType.DRIVER_REGISTERED)
  async handleEventDriverRegistered(userID: string) {
    const driverUser = await this.usersService.findOneById(userID);
    const driverProfile = await this.driverProfileService.getMyDriverProfile(
      userID,
    );
    if (driverProfile.verificationStatus == VerificationStatus.SUBMITTED) {
      this.emailService.sendDriverRegisteredMail(driverUser.email, {
        username: driverUser.username,
      });
    }
  }
}
