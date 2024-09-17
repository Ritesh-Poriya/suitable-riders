import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueError,
  OnQueueFailed,
  OnQueueRemoved,
  OnQueueStalled,
  OnQueueWaiting,
  Process,
  Processor,
} from '@nestjs/bull';
import { RedisService } from '../../redis/redis.service';
import { Job } from 'bull';
import { OTPEventEnum } from '../@types/otp.events';
import { Logger } from '@nestjs/common';

@Processor('otp')
export class OTPProcessor {
  constructor(private redisService: RedisService, private logger: Logger) {}

  @Process(OTPEventEnum.EXPIRE_OTP)
  async processSignupRequest(job: Job<{ uid: string }>) {
    try {
      this.logger.debug(
        `AuthProcessor.processSignupRequest() is called with job: ${JSON.stringify(
          job,
        )}`,
      );
      await this.redisService.getClient().del(job.data.uid);
    } catch (error) {
      this.logger.error(error);
    }
  }

  @OnQueueError()
  async onQueueError(job: Job<{ uid: string }>, error: Error) {
    this.logger.debug(
      `AuthProcessor.onQueueError() is called with job: ${JSON.stringify(
        job,
      )}, uid: ${job.data.uid}, error: ${error}`,
    );
  }

  @OnQueueWaiting()
  async onQueueWaiting(job: Job<{ uid: string }>) {
    this.logger.debug(
      `AuthProcessor.onQueueWaiting() is called with job: ${JSON.stringify(
        job,
      )}, uid: ${job.data.uid}`,
    );
  }

  @OnQueueActive()
  async onQueueActive(job: Job<{ uid: string }>) {
    this.logger.debug(
      `AuthProcessor.onQueueActive() is called with job: ${JSON.stringify(
        job,
      )}`,
    );
  }

  @OnQueueStalled()
  async onQueueStalled(job: Job<{ uid: string }>) {
    this.logger.debug(
      `AuthProcessor.onQueueStalled() is called with job: ${JSON.stringify(
        job,
      )}, uid: ${job.data.uid}`,
    );
  }

  @OnQueueCompleted()
  async onQueueCompleted(job: Job<{ uid: string }>) {
    this.logger.debug(
      `AuthProcessor.onQueueCompleted() is called with job: ${JSON.stringify(
        job,
      )}, uid: ${job.data.uid}`,
    );
  }

  @OnQueueFailed()
  async onQueueFailed(job: Job<{ uid: string }>) {
    this.logger.debug(
      `AuthProcessor.onQueueFailed() is called with job: ${JSON.stringify(
        job,
      )}, uid: ${job.data.uid}`,
    );
  }

  @OnQueueRemoved()
  async onQueueRemoved(job: Job<{ uid: string }>) {
    this.logger.debug(
      `AuthProcessor.onQueueRemoved() is called with job: ${JSON.stringify(
        job,
      )}, uid: ${job.data.uid}`,
    );
  }
}
