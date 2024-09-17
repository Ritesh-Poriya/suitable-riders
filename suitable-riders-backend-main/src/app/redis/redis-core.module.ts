import {
  DynamicModule,
  Global,
  Inject,
  Logger,
  Module,
  OnModuleDestroy,
} from '@nestjs/common';
import { REDIS_CONNECTION_NAME, REDIS_CLIENT } from './redis.constants';
import { RedisModuleOptions } from './redis.interface';
import { v4 as uuidv4 } from 'uuid';
import { defer, lastValueFrom } from 'rxjs';
import { getClient } from './redis-client.provider';
import { Redis } from 'ioredis';
import { RedisService } from './redis.service';
import { RedisHealthIndicator } from './redis-health.indicator';
import { CommonModule } from '../common/common.module';

@Global()
@Module({})
export class RedisCoreModule implements OnModuleDestroy {
  private static connectionList: Map<string, Redis> = new Map();
  constructor(
    @Inject(REDIS_CONNECTION_NAME)
    private readonly redisConnectionName: string,
    private logger: Logger,
  ) {}

  static forRoot(options: RedisModuleOptions): DynamicModule {
    const connectionID = uuidv4();

    const redisConnectionNameProvider = {
      provide: REDIS_CONNECTION_NAME,
      useValue: connectionID,
    };
    const redisConnectionProvider = {
      provide: REDIS_CLIENT,
      useFactory: async () =>
        await lastValueFrom(
          defer(async () => {
            const connection = await getClient(options);
            this.connectionList.set(connectionID, connection);
            return connection;
          }),
        ),
    };
    return {
      imports: [CommonModule],
      module: RedisCoreModule,
      providers: [
        redisConnectionNameProvider,
        redisConnectionProvider,
        RedisService,
        RedisHealthIndicator,
      ],
      exports: [RedisService, RedisHealthIndicator],
    };
  }

  async onModuleDestroy() {
    const connection = RedisCoreModule.connectionList.get(
      this.redisConnectionName,
    );
    this.logger.log('Redis connection closed', this.redisConnectionName);
    connection && (await connection.quit());
  }
}
