import { JobApprovalStatus } from 'src/app/job/@types/job-type';

export enum WebHookEvent {
  JOB_STATUS_CHANGED = 'JOB_STATUS_CHANGED',
}

export interface WebHookBody {
  event: WebHookEvent.JOB_STATUS_CHANGED;
  data: {
    jobID: string;
    jobStatus: JobApprovalStatus;
    metadata: object;
  };
}
