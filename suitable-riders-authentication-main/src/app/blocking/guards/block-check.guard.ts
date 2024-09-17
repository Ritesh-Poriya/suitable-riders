import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { CustomErrorCodes } from 'src/app/common/@types/custom-error-codes';
import { CustomHTTPException } from 'src/app/common/errors/custom.exception';
import { BlockingService } from '../blocking.service';
import { FORWARDED_IP_HEADER_KEY, RATE_LIMIT_KEY } from '../constants';

@Injectable()
export class BlockCheckGuard implements CanActivate {
  constructor(
    private blockingService: BlockingService,
    private reflector: Reflector,
    private logger: Logger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const key = this.reflector.get<number>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );
    this.logger.debug(`BlockCheckGuard.canActivate() key: ${key}`);
    if (!key) {
      this.logger.debug(
        `BlockCheckGuard.canActivate() key is not defined, returning true`,
      );
      return true;
    }
    const request: Request = context.switchToHttp().getRequest();
    const ip =
      request.header(FORWARDED_IP_HEADER_KEY) || request.socket.remoteAddress;
    this.logger.debug(`BlockCheckGuard.canActivate() ip: ${ip}`);
    if (!ip) {
      this.logger.error('No IP found in request headers');
      return true;
    }
    const res = await this.blockingService.checkIsBlocked(ip);
    this.logger.debug(
      `BlockCheckGuard.canActivate() checking is ip is blocked: res: ${res}`,
    );
    if (res.isBlocked) {
      this.logger.debug(
        `BlockCheckGuard.canActivate() ip is blocked, throwing exception`,
      );
      throw new CustomHTTPException(
        {
          key: 'errors.IP_BLOCKED',
          args: {
            timeToUnblock: res.timeToUnblock,
          },
        },
        HttpStatus.FORBIDDEN,
        CustomErrorCodes.IP_BLOCKED,
      );
    }
    this.logger.debug(
      `BlockCheckGuard.canActivate() ip is not blocked, returning true`,
    );
    return true;
  }
}
