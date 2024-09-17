import { Injectable } from '@nestjs/common';
import { HealthIndicator } from '@nestjs/terminus';
import { RedisService } from './redis.service';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly redisService: RedisService) {
    super();
  }

  async isHealthy(key: string) {
    const client = this.redisService.getClient();
    return client
      .ping()
      .then(() => this.getStatus(key, true))
      .catch(() => this.getStatus(key, false));
  }
}
