import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { CommonModule } from '../common/common.module';
import { Job, JobSchema } from './entity/job.entity';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import { Connection } from 'mongoose';
import { JobEventListener } from './listeners/job.listener';
import { autoIncrementPlugin } from '../common/utils/auto-increment.plugin';
import { AutoIncrementFieldType } from '../common/@types/auto-increment-field';
import { MerchantProfileModule } from '../merchant-profile/merchant-profile.module';
import { NotificationModule } from '../notification/notification.module';
import { VehicleModule } from '../vehicle/vehicle.module';
import { DriverProfileModule } from '../driver-profile/driver-profile.module';
import { UsersCoreModule } from '../users/users-core.module';
import { DeclinedJobs, DeclinedJobsSchema } from './entity/declined-job-entity';
import { AdminSettingModule } from '../admin-settings/admin-settings.module';
import { SaveUserLocationModule } from '../save-user-location/save-user-location.module';
import { InvoiceService } from './invoice.service';
import { JobExpireCronService } from './scheduled-tasks/job-expire-cron.service';
import { OTPModule } from '../otp/otp.module';
import { SMSModule } from '../sms/sms.module';
import { SmsTemplatesModule } from '../sms-templates/sms-templates.module';

/**
 * Job module
 */
@Module({
  imports: [
    forwardRef(() => CommonModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => MerchantProfileModule),
    forwardRef(() => VehicleModule),
    forwardRef(() => DriverProfileModule),
    forwardRef(() => OTPModule),
    UsersCoreModule,
    forwardRef(() => AdminSettingModule),
    SaveUserLocationModule,
    SMSModule,
    SmsTemplatesModule,
    MongooseModule.forFeatureAsync([
      {
        name: Job.name,
        useFactory: async (connection: Connection) => {
          const schema = JobSchema;
          const plugIn = await autoIncrementPlugin(connection, {
            fieldName: 'jobID',
            collectionName: 'jobs',
            start: 100000,
            prefix: '',
            suffix: '',
            incrementBy: 1,
            fieldType: AutoIncrementFieldType.String,
          });
          schema.plugin(plugIn);
          return schema;
        },
        inject: [getConnectionToken()],
      },
    ]),
    MongooseModule.forFeature([
      { name: DeclinedJobs.name, schema: DeclinedJobsSchema },
    ]),
  ],
  controllers: [JobController],
  providers: [
    JobService,
    JobEventListener,
    InvoiceService,
    JobExpireCronService,
  ],
  exports: [JobService],
})
export class JobModule {}
