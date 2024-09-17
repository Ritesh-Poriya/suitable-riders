import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import moment from 'moment-timezone';
import { Types } from 'mongoose';
import { AdminSettingServices } from 'src/app/admin-settings/admin-settings.service';
import { EventTypes } from 'src/app/common/@types/eventType';
import { UtilService } from 'src/app/common/util.service';
import customInterval from 'src/app/common/utils/custom-interval';
import { DriverProfileService } from 'src/app/driver-profile/driver-profile.service';
import { FCMNotificationType } from 'src/app/firebase/@types/FCMNotificationType';
import { EmailService } from 'src/app/mailer/email.service';
import { MerchantDeletedEventPayload } from 'src/app/merchant-profile/@types/merchant-deleted.event';
import { MerchantProfileService } from 'src/app/merchant-profile/merchant-profile.service';
import {
  NotificationNotes,
  NotificationType,
} from 'src/app/notification/@type/notification-type.enum';
import { NotificationService } from 'src/app/notification/notification.service';
import { OTPService } from 'src/app/otp/otp.services';
import { SaveUserLocationServices } from 'src/app/save-user-location/save-user-location.service';
import { SMSServices } from 'src/app/sms/sms.service';
import { User, UserDocument } from 'src/app/users/entity/user.entity';
import { VehicleService } from 'src/app/vehicle/vehicle.service';
import { environment } from 'src/environments';
import { JobApprovalStatus, JobEventType } from '../@types/job-type';
import { NEW_JOB_AVAILABLE_PROCESS } from '../constants';
import { InvoiceService } from '../invoice.service';
import { JobService } from '../job.service';
import { MerchantProfile } from 'src/app/merchant-profile/entity/merchant-profile.entity';
@Injectable()
export class JobEventListener {
  constructor(
    private jobService: JobService,
    private emailService: EmailService,
    private merchantProfileService: MerchantProfileService,
    private notificationService: NotificationService,
    private vehicleService: VehicleService,
    private driverProfileService: DriverProfileService,
    private logger: Logger,
    private utilService: UtilService,
    private invoiceService: InvoiceService,
    private otpService: OTPService,
    private smsService: SMSServices,
    private eventEmitter: EventEmitter2,
    private adminSettingsService: AdminSettingServices,
    private locationService: SaveUserLocationServices,
  ) {}

  public async setThumbnailImage(image) {
    if (
      image == '' &&
      (NotificationType.NEW_JOB_AVAILABLE ||
        NotificationType.JOB_CANCELLED_BY_MERCHANT ||
        NotificationType.FOOD_IS_READY ||
        NotificationType.ORDER_PICKED_UP_BY_MERCHANT)
    ) {
      image = `/media/images/platform/merchant_icon.png`;
    }
    if (
      image == '' &&
      (NotificationType.JOB_ACCEPTED ||
        NotificationType.JOB_CANCELLED_BY_DRIVER ||
        NotificationType.ORDER_PICKED_UP_BY_DRIVER ||
        NotificationType.ORDER_DELIVERED ||
        NotificationType.RIDER_HAS_ARRIVED)
    ) {
      image = `/media/images/platform/user_icon.png`;
    }
    return image;
  }
  @OnEvent(EventTypes.MerchantDeleted)
  async onMerchantDeleted(payload: MerchantDeletedEventPayload) {
    this.logger.debug(
      'JobEventListener.onMerchantDeleted() is called with payload',
      payload,
    );
    await this.jobService.deleteJobByUserId(payload.userID);
  }

  @OnEvent(JobEventType.JOB_COMPLETED)
  public async handleJobCompletedToMerchant(jobID: Types.ObjectId) {
    this.logger.debug(
      'JobEventListener.handleJobCompletedToMerchant() is called with jobID',
      jobID,
    );
    const job = await this.jobService.findOneWithDriverAndMerchant(jobID);
    const merchant = await this.merchantProfileService.findMerchantByUserId(
      (job.userID as UserDocument)._id,
    );
    const vehicle = await this.vehicleService.getVehicleById(
      String(job.usedVehicle),
    );
    const driverProfile = await this.driverProfileService.getMyDriverProfile(
      (job.driverID as UserDocument)._id,
    );
    const deliveryDate = this.jobService.getJobStatusDate(
      job.statusLogs,
      JobApprovalStatus.DELIVERED,
    );
    const pickupTime = this.jobService.getJobStatusDate(
      job.statusLogs,
      JobApprovalStatus.PICKEDUP,
    );
    const invoice = await this.invoiceService.getInvoiceID(jobID);
    await this.emailService.jobCompletedToMerchant((job.userID as User).email, {
      invoiceNumber: invoice.invoiceID,
      driverName: (job.driverID as User).username,
      driverEmail: (job.driverID as User).email,
      driverPhoneNo: (job.driverID as User).phoneNo,
      todayDate: moment(new Date()).tz('Europe/London').format('D MMM, YYYY'),
      jobDate: moment(job.createdAt).tz('Europe/London').format('D MMM, YYYY'),
      pickupTime: moment(pickupTime)
        .tz('Europe/London')
        .format('D MMM YYYY, h:mm A'),
      deliveryTime: moment(deliveryDate)
        .tz('Europe/London')
        .format('D MMM YYYY, h:mm A'),
      SRUrl: environment.SRUrl,
      vehicle: vehicle,
      vehicleName: vehicle.vehicleType.toLowerCase(),
      job: job,
      merchant: merchant,
      merchantEmail: (job.userID as User).email,
      merchantPhoneNo: (job.userID as User).phoneNo,
      driverProfile: driverProfile,
      jobOfferAmount: job.jobOfferAmount.toFixed(2),
      packageType: this.utilService.stringFormat(job.requiredPackageType),
      orderAmount: job.orderAmount.toFixed(2),
      payToMerchantAmount: (job.orderAmount - job.jobOfferAmount).toFixed(2),
      forRider: false,
    });
    await this.emailService.jobCompletedToDriver((job.driverID as User).email, {
      invoiceNumber: invoice.invoiceID,
      driverName: (job.driverID as User).username,
      driverEmail: (job.driverID as User).email,
      driverPhoneNo: (job.driverID as User).phoneNo,
      todayDate: moment(new Date()).tz('Europe/London').format('D MMM, YYYY'),
      jobDate: moment(job.createdAt).tz('Europe/London').format('D MMM, YYYY'),
      pickupTime: moment(pickupTime)
        .tz('Europe/London')
        .format('D MMM YYYY, h:mm A'),
      deliveryTime: moment(deliveryDate)
        .tz('Europe/London')
        .format('D MMM YYYY, h:mm A'),
      SRUrl: environment.SRUrl,
      vehicle: vehicle,
      vehicleName: vehicle.vehicleType.toLowerCase(),
      job: job,
      merchant: merchant,
      merchantEmail: (job.userID as User).email,
      merchantPhoneNo: (job.userID as User).phoneNo,
      driverProfile: driverProfile,
      jobOfferAmount: job.jobOfferAmount.toFixed(2),
      packageType: this.utilService.stringFormat(job.requiredPackageType),
      orderAmount: job.orderAmount.toFixed(2),
      payToMerchantAmount: (job.orderAmount - job.jobOfferAmount).toFixed(2),
      forRider: true,
    });
    const userIDs = [String((job.userID as UserDocument)._id)];
    this.logger.debug(
      'JobEventListener.sendOrderPickedupNotification() to send Notifications to users',
      userIDs,
    );
    const notification: FCMNotificationType = {
      type: NotificationType.ORDER_DELIVERED,
      details: {
        driverName: (job.driverID as User).username,
        jobNumber: job.jobID,
        jobID: job._id,
      },
      image: await this.setThumbnailImage((job.driverID as User).profileImage),
    };
    this.notificationService.sendNotificationToUsers(userIDs, notification);
  }

  @OnEvent(JobEventType.JOB_CANCELLED_BY_MERCHANT)
  public async handleJobCancelledByMerchant(jobID: Types.ObjectId) {
    this.logger.debug(
      'JobEventListener.handleJobCancelledByMerchant() is called with jobID',
      jobID,
    );
    const job = await this.jobService.findOneWithDriverAndMerchant(jobID);
    const merchant = await this.merchantProfileService.findMerchantByUserId(
      (job.userID as UserDocument)._id,
    );
    this.emailService.jobCancelledByMerchantToMerchant(
      (job.userID as User).email,
      {
        merchantBusinessName: merchant.businessInfo.businessName,
        job: job,
        dateTime: moment(job.createdAt)
          .tz('Europe/London')
          .format('D MMM, YYYY h:mm A'),
      },
    );

    if (this.jobService.hadStatus(job, JobApprovalStatus.PENDING)) {
      this.notificationService.disableJobNotification(
        jobID,
        NotificationNotes.JOB_CANCELLED_BY_MERCHANT,
      );
    }

    // if job has been accepted by driver, send notification and email to driver
    if (job.driverID) {
      this.emailService.jobCancelledByMerchantToDriver(
        (job.driverID as User).email,
        {
          driverName: (job.driverID as User).username,
          merchantBusinessName: merchant.businessInfo.businessName,
          job: job,
          dateTime: moment(job.createdAt)
            .tz('Europe/London')
            .format('D MMM, YYYY h:mm A'),
        },
      );

      const userIDs = [String((job.driverID as UserDocument)._id)];
      this.logger.debug(
        'JobEventListener.sendOrderPickedupNotification() to send Notifications to users',
        userIDs,
      );
      const notification: FCMNotificationType = {
        type: NotificationType.JOB_CANCELLED_BY_MERCHANT,
        details: {
          merchantName: (job.userID as User).username,
          jobNumber: job.jobID,
          jobID: job._id,
        },
        image: await this.setThumbnailImage((job.userID as User).profileImage),
      };
      this.notificationService.sendNotificationToUsers(userIDs, notification);
    }
  }

  @OnEvent(JobEventType.JOB_CANCELLED_BY_DRIVER)
  public async handleJobCancelledByDriver(jobID: Types.ObjectId) {
    this.logger.debug(
      'JobEventListener.handleJobCancelledByDriver() is called with jobID',
      jobID,
    );
    const job = await this.jobService.findOneWithDriverAndMerchant(jobID);
    const merchant = await this.merchantProfileService.findMerchantByUserId(
      (job.userID as UserDocument)._id,
    );
    this.emailService.jobCancelledByDriverToMerchant(
      (job.userID as User).email,
      {
        driverName: (job.driverID as User).username,
        merchantBusinessName: merchant.businessInfo.businessName,
        job: job,
        files: job.cancelReasonAttachment,
        dateTime: moment(new Date())
          .tz('Europe/London')
          .format('D MMM, YYYY h:mm A'),
      },
    );
    this.emailService.jobCancelledByDriverToDriver(
      (job.driverID as User).email,
      {
        driverName: (job.driverID as User).username,
        job: job,
        files: job.cancelReasonAttachment,
        dateTime: moment(job.createdAt)
          .tz('Europe/London')
          .format('D MMM, YYYY h:mm A'),
      },
    );
    const userIDs = [String((job.userID as UserDocument)._id)];
    this.logger.debug(
      'JobEventListener.sendOrderPickedupNotification() to send Notifications to users',
      userIDs,
    );
    const notification: FCMNotificationType = {
      type: NotificationType.JOB_CANCELLED_BY_DRIVER,
      details: {
        driverName: (job.driverID as User).username,
        jobNumber: job.jobID,
        jobID: job._id,
      },
      image: await this.setThumbnailImage((job.driverID as User).profileImage),
    };
    this.notificationService.sendNotificationToUsers(userIDs, notification);
  }

  /**
   * NEW_JOB_AVAILABLE event
   */
  @OnEvent(JobEventType.NEW_JOB_AVAILABLE)
  public async sendNewJobAvailableNotification(data: {
    jobID: Types.ObjectId;
    userIDs: Types.ObjectId[];
  }) {
    this.logger.debug(
      'JobEventListener.sendNewJobAvailableNotification() is called with jobID',
      data.jobID,
    );
    const job =
      await this.jobService.findOneWithDriverAndMerchantAndMerchantProfile(
        data.jobID,
      );
    const userIDs = [];
    for (const ID of data.userIDs) {
      userIDs.push(String(ID));
    }
    this.logger.debug(
      'JobEventListener.sendOrderPickedupNotification() to send Notifications to users',
      userIDs,
    );
    const notification: FCMNotificationType = {
      type: NotificationType.NEW_JOB_AVAILABLE,
      details: {
        jobNumber: job.jobID,
        jobID: job._id,
        businessName: (job.merchantProfileID as MerchantProfile).businessInfo
          .businessName,
      },
      image: await this.setThumbnailImage((job.userID as User).profileImage),
    };
    this.notificationService.sendNotificationToUsers(userIDs, notification);
  }

  /**
   * JOB_DECLINED_BY_DRIVER event
   */
  @OnEvent(JobEventType.JOB_DECLINED_BY_DRIVER)
  public async disableNewJobAvailableNotification(
    jobID: string,
    userID: string,
  ) {
    this.logger.debug(
      'JobEventListener.disableNewJobAvailableNotification() is called with jobID',
      jobID,
    );
    this.notificationService.disableJobNotificationByDriverID(
      userID,
      jobID,
      NotificationNotes.JOB_DECLINED_BY_DRIVER,
    );
  }

  /**
   * Job_ACCEPTED event
   */
  @OnEvent(JobEventType.JOB_ACCEPTED)
  public async sendJobAcceptedNotification(jobID: Types.ObjectId) {
    this.logger.debug(
      'JobEventListener.sendJobAcceptedNotification() is called with jobID',
      jobID,
    );
    const job = await this.jobService.findOneWithDriverAndMerchant(jobID);
    await this.notificationService.disableJobAvailableNotification(
      jobID,
      (job.driverID as UserDocument)._id,
    );
    const userIDs = [String((job.userID as UserDocument)._id)];
    this.logger.debug(
      'JobEventListener.sendOrderPickedupNotification() to send Notifications to users',
      userIDs,
    );
    const notification: FCMNotificationType = {
      type: NotificationType.JOB_ACCEPTED,
      details: {
        driverName: (job.driverID as User).username,
        jobNumber: job.jobID,
        jobID: job._id,
        preferredPaymentMethod: job.preferredPaymentMethod,
      },
      image: await this.setThumbnailImage((job.driverID as User).profileImage),
    };
    this.notificationService.sendNotificationToUsers(userIDs, notification);
  }

  /**
   * FOOD_IS_READY event
   */
  @OnEvent(JobEventType.FOOD_IS_READY)
  public async sendOrderIsReadyNotification(jobID: Types.ObjectId) {
    this.logger.debug(
      'JobEventListener.sendOrderIsReadyNotification() is called with jobID',
      jobID,
    );
    const job = await this.jobService.findOneWithDriverAndMerchant(jobID);
    const userIDs = [String((job.driverID as UserDocument)._id)];
    this.logger.debug(
      'JobEventListener.sendOrderPickedupNotification() to send Notifications to users',
      userIDs,
    );
    const notification: FCMNotificationType = {
      type: NotificationType.FOOD_IS_READY,
      details: {
        driverName: (job.driverID as User).username,
        jobNumber: job.jobID,
        jobID: job._id,
      },
      image: await this.setThumbnailImage((job.userID as User).profileImage),
    };
    this.notificationService.sendNotificationToUsers(userIDs, notification);
  }

  /**
   * RIDER_HAS_ARRIVED event
   */
  @OnEvent(JobEventType.RIDER_HAS_ARRIVED)
  public async sendRiderHasArrivedNotification(jobID: Types.ObjectId) {
    this.logger.debug(
      'JobEventListener.sendRiderHasArrivedNotification() is called with jobID',
      jobID,
    );
    const job = await this.jobService.findOneWithDriverAndMerchant(jobID);
    const userIDs = [String((job.userID as UserDocument)._id)];
    this.logger.debug(
      'JobEventListener.sendOrderPickedupNotification() to send Notifications to users',
      userIDs,
    );
    const notification: FCMNotificationType = {
      type: NotificationType.RIDER_HAS_ARRIVED,
      details: {
        driverName: (job.driverID as User).username,
        jobNumber: job.jobID,
        jobID: job._id,
      },
      image: await this.setThumbnailImage((job.driverID as User).profileImage),
    };
    this.notificationService.sendNotificationToUsers(userIDs, notification);
  }

  @OnEvent(JobEventType.JOB_UNABLE_TO_DELIVER)
  public async sendRiderUnableToDeliverNotification(jobID: Types.ObjectId) {
    this.logger.debug(
      'JobEventListener.sendRiderUnableToDeliverNotification() is called with jobID',
      jobID,
    );
    const job = await this.jobService.findOneWithDriverAndMerchant(jobID);
    const userIDs = [String((job.userID as UserDocument)._id)];
    this.logger.debug(
      'JobEventListener.sendRiderUnableToDeliverNotification() to send Notifications to users',
      userIDs,
    );
    const notification: FCMNotificationType = {
      type: NotificationType.JOB_UNABLE_TO_DELIVER,
      details: {
        driverName: (job.driverID as User).username,
        jobNumber: job.jobID,
        jobID: job._id,
        unableToDeliverReason: job.unableToDeliverReason,
      },
      image: await this.setThumbnailImage((job.driverID as User).profileImage),
    };
    this.notificationService.sendNotificationToUsers(userIDs, notification);
  }

  /**
   * ORDER_PICKED_UP_BY_MERCHANT event
   */
  @OnEvent(JobEventType.ORDER_PICKED_UP_BY_MERCHANT)
  public async sendOrderPickedUpNotificationToDriver(jobID: Types.ObjectId) {
    this.logger.debug(
      'JobEventListener.sendOrderPickedupNotification() is called with jobID',
      jobID,
    );
    const job = await this.jobService.findOneWithDriverAndMerchant(jobID);
    const userIDs = [String((job.driverID as UserDocument)._id)];
    const merchantProfile =
      await this.merchantProfileService.findMerchantByUserId(
        (job.userID as UserDocument)._id,
      );
    this.logger.debug(
      'JobEventListener.sendOrderPickedupNotification() to send Notifications to users',
      userIDs,
    );
    const notification: FCMNotificationType = {
      type: NotificationType.ORDER_PICKED_UP_BY_MERCHANT,
      details: {
        merchantName: merchantProfile.businessInfo.businessName,
        jobNumber: job.jobID,
        jobID: job._id,
      },
      image: await this.setThumbnailImage((job.userID as User).profileImage),
    };
    this.notificationService.sendNotificationToUsers(userIDs, notification);
    const otp = await this.otpService.sendOTP(job.id);
    const SMSObject = {
      msg: `Order on the way. Please provide the driver ${otp} as a verification code. You can track the order here - ${environment.SRUrl+'/tracking#'+job.id}`,
    };
    console.log("🚀 ~ file: job.listener.ts:486 ~ JobEventListener ~ sendOrderPickedUpNotificationToDriver ~ ${environment.SRUrl+'/tracking#'+job.id}:", `${environment.SRUrl+'/tracking#'+job.id}`)
    await this.smsService.sendSMS(job.phoneNumber, SMSObject);
  }

  /**
   * ORDER_PICKED_UP_BY_DRIVER event
   */
  @OnEvent(JobEventType.ORDER_PICKED_UP_BY_DRIVER)
  public async sendOrderPickedUpNotificationToMerchant(jobID: Types.ObjectId) {
    this.logger.debug(
      'JobEventListener.sendOrderPickedupNotification() is called with jobID',
      jobID,
    );
    const job = await this.jobService.findOneWithDriverAndMerchant(jobID);
    const userIDs = [String((job.userID as UserDocument)._id)];
    this.logger.debug(
      'JobEventListener.sendOrderPickedupNotification() to send Notifications to users',
      userIDs,
    );
    const notification: FCMNotificationType = {
      type: NotificationType.ORDER_PICKED_UP_BY_DRIVER,
      details: {
        driverName: (job.driverID as User).username,
        jobNumber: job.jobID,
        jobID: job._id,
      },
      image: await this.setThumbnailImage((job.driverID as User).profileImage),
    };
    this.notificationService.sendNotificationToUsers(userIDs, notification);
    const otp = await this.otpService.sendOTP(job.id);
    const SMSObject = {
      msg: `Order on the way. Please provide the driver ${otp} as a verification code. You can track the order here - ${environment.SRUrl+'/tracking#'+job.id}`,
    };
    console.log("🚀 ~ file: job.listener.ts:518 ~ JobEventListener ~ sendOrderPickedUpNotificationToMerchant ~ ${environment.SRUrl+'/tracking#'+job.id}:", `${environment.SRUrl+'/tracking#'+job.id}`)
    await this.smsService.sendSMS(job.phoneNumber, SMSObject);
  }

  /**
   * job expired event
   */
  @OnEvent(JobEventType.JOB_EXPIRED)
  public async deleteJobExpiredNotification(jobID: Types.ObjectId) {
    this.logger.debug(
      'JobEventListener.deleteJobExpiredNotification() is called with jobID',
      jobID,
    );
    this.notificationService.disableJobNotification(
      jobID,
      NotificationNotes.JOB_EXPIRED,
    );
    this.jobService.expireJobById(String(jobID));
  }

  @OnEvent(JobEventType.NEW_JOB_AVAILABLE_PROCESS)
  public async sendNewJobAvailableProcessNotification(jobID: string) {
    try {
      this.logger.debug(`Process ${NEW_JOB_AVAILABLE_PROCESS} is called`);
      this.logger.debug(
        `JobEventListener.newJobAvailable() is called with JobID: ${jobID}`,
      );
      const newJob = await this.jobService.getJobById(jobID);
      this.logger.debug('JobEventListener.newJobAvailable() newJob: ', newJob);
      if (
        !newJob?.merchantProfile?.businessInfo?.address?.location?.coordinates
      ) {
        this.logger.error(
          'JobEventListener.newJobAvailable() is called but the job is not valid, (job does not have pickup location)',
        );
        return;
      }
      const adminSettings = await this.adminSettingsService.getAdminSettings();
      this.logger.debug(
        'JobEventListener.newJobAvailable() adminSettings: ',
        adminSettings,
      );
      let driverIDsToExclude: Types.ObjectId[] = [];
      let counter = 0;
      const interval = customInterval(async () => {
        this.logger.debug(
          'JobEventListener.newJobAvailable() inside interval counter: ',
          counter,
        );
        const job = await this.jobService.getJobById(jobID);
        this.logger.debug(
          'JobEventListener.newJobAvailable() inside interval job: ',
          job,
        );
        if (job.jobStatus === JobApprovalStatus.PENDING) {
          const driversWhoDeclinedTheJob =
            await this.jobService.getSingleDeclinedJobsByMultipleDriver(jobID);
          this.logger.debug(
            'JobEventListener.newJobAvailable() inside interval driversWhoDeclinedTheJob: ',
            driversWhoDeclinedTheJob,
          );
          let concatedArray = driverIDsToExclude.concat(
            driversWhoDeclinedTheJob.map((driver) => driver.driverID),
          );
          // ~ Exclude Drivers who have job.
          concatedArray = concatedArray.concat(
            (await this.jobService.getUnavailableDrivers()).map(
              (job) => job.driverID as Types.ObjectId,
            ),
          );
          driverIDsToExclude = [...new Set(concatedArray)];
          const nearestDrivers =
            await this.locationService.getDriversListNearToJobPickupLocation(
              newJob.merchantProfile.businessInfo.address.location
                .coordinates[1],
              newJob.merchantProfile.businessInfo.address.location
                .coordinates[0],
              adminSettings.findNearbyDriversWithinMiles * 1.60934 * 1000,
              driverIDsToExclude,
              newJob.preferredVehicle,
            );
          this.logger.debug(
            'JobEventListener.newJobAvailable() nearestDrivers: ',
            nearestDrivers,
          );
          if (counter < adminSettings.makeJobPublicAfterSentToNoOfDrivers) {
            this.logger.debug(
              'JobEventListener.newJobAvailable() inside interval counter < adminSettings.makeJobPublicAfterSentToNoOfDrivers',
            );
            if (nearestDrivers.length > 0) {
              this.logger.debug(
                'JobEventListener.newJobAvailable() inside interval nearestDrivers.length > 0',
              );
              this.eventEmitter.emit(JobEventType.NEW_JOB_AVAILABLE, {
                jobID: job._id,
                userIDs: [nearestDrivers[0]._id],
              });
              driverIDsToExclude = [
                ...driverIDsToExclude,
                nearestDrivers[0]._id,
              ];
              counter++;
            } else {
              this.logger.debug(
                'JobEventListener.newJobAvailable() inside interval nearestDrivers.length > 0 else block',
              );
              clearInterval(interval);
            }
          } else {
            clearInterval(interval);
          }
        } else {
          this.logger.debug(
            'JobEventListener.newJobAvailable() inside interval job.status === JobApprovalStatus.PENDING else block',
          );
          clearInterval(interval);
        }
      }, adminSettings.sendJobToNextNearestDriverInSeconds * 1000);
    } catch (error) {
      this.logger.error(
        `JobEventListener.newJobAvailable() is called with jobID: ${jobID}, error:  ${JSON.stringify(
          error,
        )}`,
      );
    }
  }
}
