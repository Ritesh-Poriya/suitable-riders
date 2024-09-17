import { Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { catchError, throwError } from 'rxjs';
import { BlockingService } from '../blocking.service';
import {
  FORWARDED_IP_HEADER_KEY,
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
    private logger: Logger,
  ) {}
  intercept(context, next) {
    const limitKey = this.reflector.get<string>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );
    this.logger.debug(
      `RateLimitErrorInterceptor.intercept() limitKey: ${limitKey}`,
    );
    const windowKey = this.reflector.get<string>(
      RATE_LIMIT_IN_WINDOW_KEY,
      context.getHandler(),
    );
    this.logger.debug(
      `RateLimitErrorInterceptor.intercept() windowKey: ${windowKey}`,
    );
    const blockDurationKey = this.reflector.get<string>(
      IP_BLOCK_DURATION_KEY,
      context.getHandler(),
    );
    this.logger.debug(
      `RateLimitErrorInterceptor.intercept() blockDurationKey: ${blockDurationKey}`,
    );
    const limit = this.configService.get<number>(
      `settings.IPBlocking.${limitKey}`,
    );
    this.logger.debug(`RateLimitErrorInterceptor.intercept() limit: ${limit}`);
    const windowInMinutes = this.configService.get<number>(
      `settings.IPBlocking.${windowKey}`,
    );
    this.logger.debug(
      `RateLimitErrorInterceptor.intercept() windowInMinutes: ${windowInMinutes}`,
    );
    const blockDurationInMinutes = this.configService.get<number>(
      `settings.IPBlocking.${blockDurationKey}`,
    );
    this.logger.debug(
      `RateLimitErrorInterceptor.intercept() blockDurationInMinutes: ${blockDurationInMinutes}`,
    );
    const errorType = this.reflector.get<new (...args: any[]) => Error>(
      RATE_LIMIT_ERROR,
      context.getHandler(),
    );
    this.logger.debug(
      `RateLimitErrorInterceptor.intercept() errorType: ${errorType.name}`,
    );
    const request = context.switchToHttp().getRequest();
    const ip =
      request.header(FORWARDED_IP_HEADER_KEY) || request.socket.remoteAddress;
    this.logger.debug(`RateLimitErrorInterceptor.intercept() ip: ${ip}`);
    const url = request.url;
    this.logger.debug(`RateLimitErrorInterceptor.intercept() url: ${url}`);
    return next.handle().pipe(
      catchError((error) => {
        this.logger.debug(
          `RateLimitErrorInterceptor.intercept() inside catchError with error: ${JSON.stringify(
            error,
          )}`,
        );
        if (limit && errorType) {
          this.logger.debug(
            `RateLimitErrorInterceptor.intercept() inside if with limit: ${limit} and errorType: ${errorType.name}`,
          );
          this.logger.debug(
            `RateLimitErrorInterceptor.intercept() instanceof errorType: ${
              error instanceof errorType
            }`,
          );
          if (error instanceof errorType) {
            this.logger.debug(
              `RateLimitErrorInterceptor.intercept() inside if with error instanceof errorType`,
            );
            this.blockingService.handleRateLimit({
              ip,
              url,
              limit,
              windowInMinutes,
              blockDurationInMinutes,
              removeLastPartOfUrl: true,
              isCheckingOnError: true,
            });
          }
        }
        return throwError(() => error);
      }),
    );
  }
}
