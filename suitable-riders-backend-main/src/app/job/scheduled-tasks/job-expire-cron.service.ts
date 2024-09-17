import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JobEventType } from 'src/app/job/@types/job-type';
import { JobService } from 'src/app/job/job.service';

@Injectable()
export class JobExpireCronService {
  constructor(
    private jobService: JobService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    const pendingJobs = await this.jobService.getJobsToExpire();
    for (const job of pendingJobs) {
      this.eventEmitter.emit(JobEventType.JOB_EXPIRED, job._id);
    }
  }
}
