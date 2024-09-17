import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { catchError, Observable, throwError } from 'rxjs';
import { BlockingService } from '../blocking.service';
import {
  FORWARDED_IP_HEADER_KEY,
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
    private logger: Logger,
  ) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const limitKey = this.reflector.get<string>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );
    this.logger.debug(
      `RateLimitingInterceptor.intercept() limitKey: ${limitKey}`,
    );
    const windowKey = this.reflector.get<string>(
      RATE_LIMIT_IN_WINDOW_KEY,
      context.getHandler(),
    );
    this.logger.debug(
      `RateLimitingInterceptor.intercept() windowKey: ${windowKey}`,
    );
    const blockDurationKey = this.reflector.get<string>(
      IP_BLOCK_DURATION_KEY,
      context.getHandler(),
    );
    this.logger.debug(
      `RateLimitingInterceptor.intercept() blockDurationKey: ${blockDurationKey}`,
    );
    const limit = this.configService.get<number>(
      `settings.IPBlocking.${limitKey}`,
    );
    this.logger.debug(`RateLimitingInterceptor.intercept() limit: ${limit}`);
    const windowInMinutes = this.configService.get<number>(
      `settings.IPBlocking.${windowKey}`,
    );
    this.logger.debug(
      `RateLimitingInterceptor.intercept() windowInMinutes: ${windowInMinutes}`,
    );
    const blockDurationInMinutes = this.configService.get<number>(
      `settings.IPBlocking.${blockDurationKey}`,
    );
    this.logger.debug(
      `RateLimitingInterceptor.intercept() blockDurationInMinutes: ${blockDurationInMinutes}`,
    );
    const request = context.switchToHttp().getRequest();
    const ip =
      request.header(FORWARDED_IP_HEADER_KEY) || request.socket.remoteAddress;
    this.logger.debug(`RateLimitingInterceptor.intercept() ip: ${ip}`);
    const url = request.url;
    this.logger.debug(`RateLimitingInterceptor.intercept() url: ${url}`);
    await this.blockingService.handleRateLimit({
      ip,
      url,
      limit,
      windowInMinutes,
      blockDurationInMinutes,
    });
    return next.handle().pipe(
      catchError((err) => {
        this.logger.debug(
          `RateLimitingInterceptor.intercept(): inside handle().pipe() error: ${JSON.stringify(
            err,
          )}`,
        );
        this.blockingService.handleRateLimitRouteThrewError(ip, url);
        return throwError(() => err);
      }),
    );
  }
}
