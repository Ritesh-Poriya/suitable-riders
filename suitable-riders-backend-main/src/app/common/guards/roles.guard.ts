import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomHTTPException } from 'src/app/common/errors/custom.exception';
import { UserPayload } from 'src/app/jwt/@types/user-payload.interface';
import { UserRole } from 'src/app/users/@types/user-role-type';
import { UsersService } from 'src/app/users/users.service';
import { CustomErrorCodes } from '../@types/custom-error-codes';
import { IS_SUBSCRIPTION_ACTIVE, ROLES_KEY } from '../constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const isSubscriptionActive = this.reflector.get<boolean>(
      IS_SUBSCRIPTION_ACTIVE,
      context.getHandler(),
    );
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
    if (isSubscriptionActive) {
      const isUserSubscription = await this.userService.isSubscriptionActive(
        user.userID,
      );
      if (isUserSubscription) {
        throw new CustomHTTPException(
          {
            key: 'errors.SUBSCRIPTION_INACTIVE',
          },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.SUBSCRIPTION_INACTIVE,
        );
      }
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
    return roles.some((role) => user.role === role);
  }
}
