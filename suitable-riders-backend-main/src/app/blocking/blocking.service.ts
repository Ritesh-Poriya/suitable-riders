import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Bull, { Queue } from 'bull';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class BlockingService {
  constructor(
    private redisService: RedisService,
    @InjectQueue('blocking') private blockingQueue: Queue,
    private configService: ConfigService,
  ) {}

  public async handleRateLimit(args: {
    ip: string;
    url: string;
    limit: number;
    windowInMinutes: number;
    blockDurationInMinutes: number;
  }) {
    if (!args.limit || !args.windowInMinutes || !args.blockDurationInMinutes) {
      throw new Error('Rate limit decorator must be used with proper keys');
    }
    const key = `${args.ip}:${args.url}`;
    const currentCount = await this.redisService.getClient().get(key);
    await this.redisService
      .getClient()
      .set(key, currentCount ? +currentCount + 1 : 1);
    if (currentCount && +currentCount + 1 >= args.limit) {
      this.blockIPForTime(args.ip, args.blockDurationInMinutes);
    }
    const job = await this.blockingQueue.add(
      'handleTimeOutOnBlock',
      {
        key,
      },
      {
        delay: args.windowInMinutes * 60 * 1000,
      },
    );
    this.addJobForIP(args.ip, job.id);
  }

  private async blockIPForTime(ip: string, time: number) {
    this.removeJobsForIP(ip);
    await this.removeKeysAssociatedWithIP(ip);
    const key = `${ip}:blocked`;
    this.redisService.getClient().set(key, time);
    await this.blockingQueue.add(
      'handleTimeOutOnBlockIP',
      { key, ip },
      { delay: time * 60 * 1000 },
    );
  }

  private async removeKeysAssociatedWithIP(ip: string) {
    const prefix = this.configService.get<string>('redisDB.keyPrefix');
    const keys = await this.redisService.getClient().keys(`${prefix}${ip}:*`);
    for (let k of keys) {
      k = k.replace(prefix, '');
      await this.redisService.getClient().del(k);
    }
  }

  private async removeJobsForIP(ip: string) {
    const jobs: Bull.JobId[] = JSON.parse(
      await this.redisService.getClient().get(ip),
    );
    for (const jobId of jobs) {
      const jobInQueue = await this.blockingQueue.getJob(jobId);
      if (jobInQueue) {
        await jobInQueue.remove();
      }
    }
  }

  async checkIsBlocked(ip: any) {
    const key = `${ip}:blocked`;
    const blocked = await this.redisService.getClient().get(key);
    if (blocked && +blocked > 0) {
      return {
        isBlocked: true,
        timeToUnblock: +blocked,
      };
    }
    return {
      isBlocked: false,
    };
  }

  private async addJobForIP(ip: string, jobId: Bull.JobId) {
    const jobs: Bull.JobId[] =
      JSON.parse(await this.redisService.getClient().get(ip)) || [];
    jobs.push(jobId);
    await this.redisService.getClient().set(ip, JSON.stringify(jobs));
  }
}
