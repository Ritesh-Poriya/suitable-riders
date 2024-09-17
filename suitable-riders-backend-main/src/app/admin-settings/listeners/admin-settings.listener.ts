import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import moment from 'moment';
import { DriverProfileCronType } from 'src/app/driver-profile/@types/driver-profile-cron-name.type';
import { DriverProfileEventType } from 'src/app/driver-profile/@types/driver-profile-event-type';
import { EmailService } from 'src/app/mailer/email.service';
import { MerchantProfileService } from 'src/app/merchant-profile/merchant-profile.service';
import { MerchantCronType } from 'src/app/merchant/@types/merchant-cron-name.type';
import { UsersService } from 'src/app/users/users.service';
import { AdminSettingsEventType } from '../@types/admin-settings-event-type';
import { AdminSettingServices } from '../admin-settings.service';

@Injectable()
export class AdminSettingsEventListener {
  constructor(
    private adminSettingsService: AdminSettingServices,
    private eventEmitter: EventEmitter2,
    private schedulerRegistry: SchedulerRegistry,
    private logger: Logger,
    private userService: UsersService,
    private emailService: EmailService,
    private merchantProfileService: MerchantProfileService,
  ) {}

  @OnEvent(AdminSettingsEventType.IS_DAY_LIGHT_SAVING_ENABLED_UPDATE)
  async handleEventUpdateDayLightSavingEnabled() {
    // Cron Service for all driver unavailable at 3am everyday
    try {
      const job = this.schedulerRegistry.getCronJob(
        DriverProfileCronType.DRIVER_UNAVAILABLE_CRON,
      );
      if (job) {
        job.stop();
        this.schedulerRegistry.deleteCronJob(
          DriverProfileCronType.DRIVER_UNAVAILABLE_CRON,
        );
      }
    } catch (error) {
      this.logger.error(error);
    }
    let cronTime = 3; // All driver unavailable at 3am everyday
    const adminSetting = await this.adminSettingsService.getAdminSettings();
    if (adminSetting.isDayLightSavingEnabled === true) {
      cronTime = 2; // All driver unavailable at 3am in daylight saving
    }
    const newJob = new CronJob(`0 ${cronTime} * * *`, () => {
      this.eventEmitter.emit(DriverProfileEventType.UNAVAILABLE_DRIVER);
    });

    this.schedulerRegistry.addCronJob(
      DriverProfileCronType.DRIVER_UNAVAILABLE_CRON,
      newJob,
    );
    newJob.start();

    // Cron service for send monthly email to merchant

    try {
      const job = this.schedulerRegistry.getCronJob(
        MerchantCronType.MONTHLY_SUBSCRIPTION_EMAIL_CRON,
      );
      if (job) {
        job.stop();
        this.schedulerRegistry.deleteCronJob(
          MerchantCronType.MONTHLY_SUBSCRIPTION_EMAIL_CRON,
        );
      }
    } catch (error) {
      this.logger.error(error);
    }
    let cronTimeForEmail = 11; // every day at 11am in uk and  4:30pm in india
    if (adminSetting.isDayLightSavingEnabled === true) {
      cronTimeForEmail = 10; // every day at 10am in uk daylight saving and 3:30pm in india
    }
    const job = new CronJob(`0 ${cronTimeForEmail} * * *`, async () => {
      const toDay = moment(new Date()).format('YYYY-MM-DD');
      const lastDayOfMonth = moment(toDay).endOf('month').format('YYYY-MM-DD');
      console.log(toDay);
      console.log(lastDayOfMonth);
      const users = await this.userService.getAllMerchantUsers();

      // if today is last day of month
      if (toDay === lastDayOfMonth) {
        for (const user of users) {
          const merchantProfile =
            await this.merchantProfileService.getMyMerchantProfile(user._id);
          await this.emailService.monthlySubscriptionReminderToMerchantLastDay(
            user.email,
            {
              merchantBusinessName: merchantProfile.businessInfo.businessName,
              month: moment(new Date()).add(1, 'months').format('MMMM'),
            },
          );
        }
      }
      const lastSevenDayOfMonth = moment(new Date())
        .endOf('month')
        .subtract(7, 'days')
        .format('YYYY-MM-DD');

      // if today is last 7 day of month
      if (toDay === lastSevenDayOfMonth) {
        for (const user of users) {
          const merchantProfile =
            await this.merchantProfileService.getMyMerchantProfile(user._id);
          await this.emailService.monthlySubscriptionReminderToMerchantLastSevenDay(
            user.email,
            {
              merchantBusinessName: merchantProfile.businessInfo.businessName,
              month: moment(new Date()).add(1, 'months').format('MMMM'),
            },
          );
        }
      }
    });

    this.schedulerRegistry.addCronJob(
      MerchantCronType.MONTHLY_SUBSCRIPTION_EMAIL_CRON,
      job,
    );
    job.start();
  }
}
