import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { AdminSettingServices } from 'src/app/admin-settings/admin-settings.service';
import { DriverProfileCronType } from '../@types/driver-profile-cron-name.type';
import { DriverProfileEventType } from '../@types/driver-profile-event-type';

@Injectable()
export class DriverProfileUnAvailableCronService implements OnModuleInit {
  constructor(
    private eventEmitter: EventEmitter2,
    private schedulerRegistry: SchedulerRegistry,
    private adminSettingsService: AdminSettingServices,
  ) {}

  async onModuleInit() {
    let cronTime = 3; // All driver unavailable at 3am everyday
    const adminSetting = await this.adminSettingsService.getAdminSettings();
    if (adminSetting.isDayLightSavingEnabled === true) {
      cronTime = 2; // All driver unavailable at 3am in daylight saving
    }
    const job = new CronJob(`0 ${cronTime} * * *`, () => {
      this.eventEmitter.emit(DriverProfileEventType.UNAVAILABLE_DRIVER);
    });

    this.schedulerRegistry.addCronJob(
      DriverProfileCronType.DRIVER_UNAVAILABLE_CRON,
      job,
    );
    job.start();
  }
}
