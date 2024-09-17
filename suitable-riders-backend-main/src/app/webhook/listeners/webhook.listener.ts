import { Injectable, Logger } from '@nestjs/common';
import { WebHookService } from '../webhook.service';
import { WebHookEventType } from '../@types/webhook-type';
import { Job } from 'src/app/job/entity/job.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { WebHookEvent } from '../@types/WebHookBody';
import { JobApprovalStatus } from 'src/app/job/@types/job-type';

@Injectable()
export class WebHookEventListener {
  constructor(private webhookService: WebHookService, private logger: Logger) {}

  @OnEvent(WebHookEventType.JOB_STATUS_CHANGED)
  async onJobStatusChange(job: Job) {
    this.logger.debug(
      'WebHookEventType.onJobStatusChange() is called with job',
      job,
    );
    if (
      job.isFromOutsideRiders &&
      (job.jobStatus == JobApprovalStatus.PICKEDUP ||
        job.jobStatus == JobApprovalStatus.DELIVERED)
    ) {
      let res = await this.webhookService.triggerEvent({
        event: WebHookEvent.JOB_STATUS_CHANGED,
        data: {
          jobStatus: job.jobStatus,
          jobID: job.jobID,
          metadata: job.metadata,
        },
      });

      this.logger.debug(
        'WebHookEventType.onJobStatusChange() web Hook response',
        { status: res.status, data: res.data, statusText: res.statusText },
      );
    }
  }
}
