import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomErrorCodes } from 'src/app/common/@types/custom-error-codes';
import { CustomHTTPException } from 'src/app/common/errors/custom.exception';
import { UserPayload } from 'src/app/jwt/@types/user-payload.interface';
import { UserRole } from 'src/app/users/@types/user-role-type';
import { ROLES_KEY } from '../constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const { user } = context.switchToHttp().getRequest();
    const isAccessible = this.matchRoles(roles, user);
    if (!isAccessible) {
      throw new CustomHTTPException(
        {
          key: 'errors.FORBIDDEN',
        },
        HttpStatus.FORBIDDEN,
        CustomErrorCodes.FORBIDDEN,
      );
    }
    return isAccessible;
  }

  matchRoles(roles: UserRole[], user: UserPayload): boolean {
    if (!user) {
      return false;
    }
    if (!roles.length) {
      return true;
    }
    return roles.some((role) => user.role.includes(role));
  }
}
