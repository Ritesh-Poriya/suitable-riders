import { DynamicModule, Module } from '@nestjs/common';
import { RedisCoreModule } from './redis-core.module';
import { RedisModuleOptions } from './redis.interface';

@Module({})
export class RedisModule {
  static forRoot(options: RedisModuleOptions): DynamicModule {
    return {
      module: RedisModule,
      imports: [RedisCoreModule.forRoot(options)],
    };
  }
}
