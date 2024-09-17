import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { Public } from '../common/decorators/public-route.decorator';

@Controller({ path: 'api/health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mongo: MongooseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @Public()
  @ApiTags('healthCheck')
  check() {
    return this.health.check([async () => this.mongo.pingCheck('mongo')]);
  }
}
