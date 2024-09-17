import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { BlockingService } from '../blocking.service';
import {
  IP_BLOCK_DURATION_KEY,
  RATE_LIMIT_IN_WINDOW_KEY,
  RATE_LIMIT_KEY,
} from '../constants';

@Injectable()
export class RateLimitingInterceptor implements NestInterceptor {
  constructor(
    private blockingService: BlockingService,
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const limitKey = this.reflector.get<string>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );
    const windowKey = this.reflector.get<string>(
      RATE_LIMIT_IN_WINDOW_KEY,
      context.getHandler(),
    );
    const blockDurationKey = this.reflector.get<string>(
      IP_BLOCK_DURATION_KEY,
      context.getHandler(),
    );
    const limit = this.configService.get<number>(
      `settings.IPBlocking.${limitKey}`,
    );
    const windowInMinutes = this.configService.get<number>(
      `settings.IPBlocking.${windowKey}`,
    );
    const blockDurationInMinutes = this.configService.get<number>(
      `settings.IPBlocking.${blockDurationKey}`,
    );
    const request = context.switchToHttp().getRequest();
    const ip =
      request.headers['x-forwarded-for'] || request.socket.remoteAddress;
    const url = request.url;
    return next.handle().pipe(
      tap(async () => {
        await this.blockingService.handleRateLimit({
          ip,
          url,
          limit,
          windowInMinutes,
          blockDurationInMinutes,
        });
      }),
    );
  }
}
