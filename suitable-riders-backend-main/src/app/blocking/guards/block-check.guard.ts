import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomErrorCodes } from 'src/app/common/@types/custom-error-codes';
import { CustomHTTPException } from 'src/app/common/errors/custom.exception';
import { BlockingService } from '../blocking.service';
import { RATE_LIMIT_KEY } from '../constants';

@Injectable()
export class BlockCheckGuard implements CanActivate {
  constructor(
    private blockingService: BlockingService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const key = this.reflector.get<number>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );
    if (!key) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const ip =
      request.headers['x-forwarded-for'] || request.socket.remoteAddress;
    const res = await this.blockingService.checkIsBlocked(ip);
    if (res.isBlocked) {
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
    return true;
  }
}
