import { Injectable, NestInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { catchError, throwError } from 'rxjs';
import { BlockingService } from '../blocking.service';
import {
  IP_BLOCK_DURATION_KEY,
  RATE_LIMIT_ERROR,
  RATE_LIMIT_IN_WINDOW_KEY,
  RATE_LIMIT_KEY,
} from '../constants';

@Injectable()
export class RateLimitErrorInterceptor implements NestInterceptor {
  constructor(
    private blockingService: BlockingService,
    private configService: ConfigService,
    private reflector: Reflector,
  ) {}
  intercept(context, next) {
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
    const errorType = this.reflector.get<new (...args: any[]) => Error>(
      RATE_LIMIT_ERROR,
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest();
    const ip =
      request.headers['x-forwarded-for'] || request.socket.remoteAddress;
    const url = request.url;
    return next.handle().pipe(
      catchError((error) => {
        if (limit && errorType) {
          if (error instanceof errorType) {
            this.blockingService.handleRateLimit({
              ip,
              url,
              limit,
              windowInMinutes,
              blockDurationInMinutes,
            });
          }
        }
        return throwError(() => error);
      }),
    );
  }
}
