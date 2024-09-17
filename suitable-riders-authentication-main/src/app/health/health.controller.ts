import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { Public } from '../common/decorators/public-route.decorator';
import { RedisHealthIndicator } from '../redis/redis-health.indicator';

@Controller('api/auth/health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private redis: RedisHealthIndicator,
    private mongo: MongooseHealthIndicator,
    private configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  @Public()
  @ApiTags('healthCheck')
  check() {
    console.log('*********************************');
    console.log(this.configService.get('redis.host'));
    console.log(this.configService.get('redis.port'));
    return this.health.check([
      async () => this.mongo.pingCheck('mongo'),
      async () => this.redis.isHealthy('redis'),
    ]);
  }
}
