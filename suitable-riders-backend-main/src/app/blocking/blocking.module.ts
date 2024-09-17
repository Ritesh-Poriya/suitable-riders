import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { BlockingService } from './blocking.service';
import { RateLimitErrorInterceptor } from './interceptors/rate-limit-error.interceptor';
import { RateLimitingInterceptor } from './interceptors/rate-limiting.interceptor';
import { BlockingUnblockingProcessor } from './processors/handle-timeout.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'blocking',
    }),
  ],
  providers: [
    BlockingService,
    RateLimitingInterceptor,
    RateLimitErrorInterceptor,
    BlockingUnblockingProcessor,
  ],
  exports: [
    RateLimitingInterceptor,
    BlockingService,
    RateLimitErrorInterceptor,
  ],
})
export class BlockingModule {}
