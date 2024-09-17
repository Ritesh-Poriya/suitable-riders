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
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import logger from 'src/app/common/logger';
import { RedisService } from '../../redis/redis.service';

logger.log('BlockingUnblockingProcessor is called');
@Processor('blocking')
export class BlockingUnblockingProcessor {
  constructor(private redisService: RedisService, private logger: Logger) {}
  @Process('handleTimeOutOnBlock')
  async handleTimeOutOnBlock(job: Job<{ key: string }>) {
    try {
      this.logger.debug(
        `BlockingUnblockingProcessor.handleTimeOutOnBlock() is called with job: ${JSON.stringify(
          job,
        )}`,
      );
      const count = await this.redisService.getClient().get(job.data.key);
      this.logger.debug(
        `BlockingUnblockingProcessor.handleTimeOutOnBlock() count: ${count}`,
      );
      if (count && +count === 1) {
        this.logger.debug(
          `BlockingUnblockingProcessor.handleTimeOutOnBlock() inside if (count && +count === 1) and deleting key: ${job.data.key}`,
        );
        await this.redisService.getClient().del(job.data.key);
      } else if (count && +count > 1) {
        this.logger.debug(
          `BlockingUnblockingProcessor.handleTimeOutOnBlock() inside else if (count && +count > 1) and decrementing count for key: ${
            job.data.key
          } to ${+count - 1}`,
        );
        await this.redisService.getClient().set(job.data.key, +count - 1);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  @Process('handleTimeOutOnBlockIP')
  async handleTimeOutOnBlockIP(job: Job<{ key: string; ip: string }>) {
    this.logger.debug(
      `BlockingUnblockingProcessor.handleTimeOutOnBlockIP() is called with job: ${JSON.stringify(
        job,
      )}`,
    );
    this.logger.debug(
      `BlockingUnblockingProcessor.handleTimeOutOnBlockIP() deleting key: ${job.data.key}`,
    );
    await this.redisService.getClient().del(job.data.key);
  }

  @OnQueueError()
  async onQueueError(job: Job, error: Error) {
    this.logger.debug(
      `BlockingUnblockingProcessor.onQueueError() is called with job: ${JSON.stringify(
        job,
      )} and error: ${JSON.stringify(error)}`,
    );
  }

  @OnQueueWaiting()
  async onQueueWaiting(jobId: number | string) {
    this.logger.debug(
      `BlockingUnblockingProcessor.onQueueWaiting() is called with jobId: ${jobId}`,
    );
  }

  @OnQueueActive()
  async onQueueActive(job: Job) {
    this.logger.debug(
      `BlockingUnblockingProcessor.onQueueActive() is called with job: ${JSON.stringify(
        job,
      )}`,
    );
  }

  @OnQueueStalled()
  async onQueueStalled(jobId: number | string) {
    this.logger.debug(
      `BlockingUnblockingProcessor.onQueueStalled() is called with jobId: ${jobId}`,
    );
  }

  @OnQueueCompleted()
  async onQueueCompleted(job: Job) {
    this.logger.debug(
      `BlockingUnblockingProcessor.onQueueCompleted() is called with job: ${JSON.stringify(
        job,
      )}`,
    );
  }

  @OnQueueFailed()
  async onQueueFailed(job: Job) {
    this.logger.debug(
      `BlockingUnblockingProcessor.onQueueFailed() is called with job: ${JSON.stringify(
        job,
      )}`,
    );
  }

  @OnQueueRemoved()
  async onQueueRemoved(job: Job) {
    this.logger.debug(
      `BlockingUnblockingProcessor.onQueueRemoved() is called with job: ${JSON.stringify(
        job,
      )}`,
    );
  }
}
