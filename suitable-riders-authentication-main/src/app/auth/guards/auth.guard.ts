import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomErrorCodes } from 'src/app/common/@types/custom-error-codes';
import { IS_PUBLIC } from 'src/app/common/constants';
import { CustomHTTPException } from 'src/app/common/errors/custom.exception';
import { UserPayload } from 'src/app/jwt/@types/user-payload.interface';
import { JwtService } from 'src/app/jwt/jwt.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC,
      context.getHandler(),
    );
    const token = request.headers.authorization;
    if (token) {
      let user: UserPayload;
      try {
        user = await this.jwtService.validateAccessToken(token);
      } catch (error) {
        user = null;
      }
      if (user) {
        request.user = user;
        return true;
      } else {
        if (isPublic) {
          request.user = null;
          return true;
        } else {
          throw new CustomHTTPException(
            { key: 'errors.UNAUTHORIZED' },
            HttpStatus.UNAUTHORIZED,
            CustomErrorCodes.UNAUTHORIZED,
          );
        }
      }
    } else {
      if (isPublic) {
        request.user = null;
        return true;
      } else {
        throw new CustomHTTPException(
          { key: 'errors.UNAUTHORIZED' },
          HttpStatus.UNAUTHORIZED,
          CustomErrorCodes.UNAUTHORIZED,
        );
      }
    }
  }
}
