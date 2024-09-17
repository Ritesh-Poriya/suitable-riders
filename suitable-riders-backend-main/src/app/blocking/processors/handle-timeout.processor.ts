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
import { RedisService } from '../../redis/redis.service';

@Processor('blocking')
export class BlockingUnblockingProcessor {
  constructor(private redisService: RedisService, private logger: Logger) {}
  @Process('handleTimeOutOnBlock')
  async handleTimeOutOnBlock(job: Job<{ key: string }>) {
    try {
      const count = await this.redisService.getClient().get(job.data.key);
      if (count && +count === 1) {
        await this.redisService.getClient().del(job.data.key);
      } else if (count && +count > 1) {
        await this.redisService.getClient().set(job.data.key, +count - 1);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }
  @Process('handleTimeOutOnBlockIP')
  async handleTimeOutOnBlockIP(job: Job<{ key: string; ip: string }>) {
    try {
      await this.redisService.getClient().del(job.data.key);
    } catch (error) {
      this.logger.error(error);
    }
  }

  @OnQueueError()
  async onQueueError(job: Job<{ key: string; ip: string }>, error: Error) {
    this.logger.debug(
      `BlockingUnblockingProcessor.onQueueRemoved() is called with job: ${JSON.stringify(
        job,
      )}, error: ${JSON.stringify(error)}`,
    );
  }

  @OnQueueWaiting()
  async onQueueWaiting(job: Job<{ key: string; ip: string }>) {
    this.logger.debug(
      `BlockingUnblockingProcessor.onQueueWaiting() is called with job: ${JSON.stringify(
        job,
      )}`,
    );
  }

  @OnQueueActive()
  async onQueueActive(job: Job<{ key: string; ip: string }>) {
    this.logger.debug(
      `BlockingUnblockingProcessor.onQueueActive() is called with job: ${JSON.stringify(
        job,
      )}`,
    );
  }

  @OnQueueStalled()
  async onQueueStalled(job: Job<{ key: string; ip: string }>) {
    this.logger.debug(
      `BlockingUnblockingProcessor.onQueueStalled() is called with job: ${JSON.stringify(
        job,
      )}`,
    );
  }

  @OnQueueCompleted()
  async onQueueCompleted(job: Job<{ key: string; ip: string }>) {
    this.logger.debug(
      `BlockingUnblockingProcessor.onQueueCompleted() is called with job: ${JSON.stringify(
        job,
      )}`,
    );
  }

  @OnQueueFailed()
  async onQueueFailed(job: Job<{ key: string; ip: string }>) {
    this.logger.debug(
      `BlockingUnblockingProcessor.onQueueFailed() is called with job: ${JSON.stringify(
        job,
      )}`,
    );
  }

  @OnQueueRemoved()
  async onQueueRemoved(job: Job<{ key: string; ip: string }>) {
    this.logger.debug(
      `BlockingUnblockingProcessor.onQueueRemoved() is called with job: ${JSON.stringify(
        job,
      )}`,
    );
  }
}
