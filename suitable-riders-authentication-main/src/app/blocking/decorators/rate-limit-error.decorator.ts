import {
  applyDecorators,
  SetMetadata,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  IP_BLOCK_DURATION_KEY,
  RATE_LIMIT_ERROR,
  RATE_LIMIT_IN_WINDOW_KEY,
  RATE_LIMIT_KEY,
} from '../constants';
import { BlockCheckGuard } from '../guards/block-check.guard';
import { RateLimitErrorInterceptor } from '../interceptors/rate-limit-error.interceptor';

export function RateLimitError(args: {
  Class: new (...args: any[]) => Error;
  limitKey: string;
  windowKey: string;
  blockDurationKey: string;
}) {
  return applyDecorators(
    SetMetadata(RATE_LIMIT_KEY, args.limitKey),
    SetMetadata(RATE_LIMIT_ERROR, args.Class),
    SetMetadata(RATE_LIMIT_IN_WINDOW_KEY, args.windowKey),
    SetMetadata(IP_BLOCK_DURATION_KEY, args.blockDurationKey),
    UseInterceptors(RateLimitErrorInterceptor),
    UseGuards(BlockCheckGuard),
  );
}
