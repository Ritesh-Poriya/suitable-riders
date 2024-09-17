import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { UserRole } from 'src/app/users/@types/user-role-type';
import { ROLES_KEY } from '../constants';
import { RolesGuard } from '../guards/roles.guard';

export const Roles = (...roles: UserRole[]) =>
  applyDecorators(SetMetadata(ROLES_KEY, roles), UseGuards(RolesGuard));
