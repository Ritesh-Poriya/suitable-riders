import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  AUTHORIZATION_QUERY_PARAM_KEY,
  CHECKED_BLOCKED_USER,
  IS_PUBLIC,
} from 'src/app/common/constants';
import { CustomHTTPException } from 'src/app/common/errors/custom.exception';
import { UserPayload } from 'src/app/jwt/@types/user-payload.interface';
import { JwtService } from 'src/app/jwt/jwt.service';
import { UsersService } from 'src/app/users/users.service';
import { CustomErrorCodes } from '../@types/custom-error-codes';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC,
      context.getHandler(),
    );
    const checkBlockedUser = this.reflector.get<boolean>(
      CHECKED_BLOCKED_USER,
      context.getHandler(),
    );
    let token: string | undefined;
    const queryToken = request.query[AUTHORIZATION_QUERY_PARAM_KEY];
    if (queryToken) {
      token = queryToken;
    }
    const headerToken = request.headers.authorization;
    if (headerToken) {
      token = headerToken;
    }
    if (token) {
      let user: UserPayload;
      try {
        user = await this.jwtService.validateAccessToken(token);
      } catch (error) {
        user = null;
      }
      if (user && checkBlockedUser) {
        const isUserBlocked = await this.userService.checkIsUserBlocked(
          user.userID,
        );
        if (isUserBlocked) {
          throw new CustomHTTPException(
            {
              key: 'errors.ACCOUNT_BLOCKED',
            },
            HttpStatus.FORBIDDEN,
            CustomErrorCodes.USER_BLOCKED,
          );
        }
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
