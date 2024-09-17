import { User } from '../entity/user.entity';
import { OmitType } from '@nestjs/mapped-types';

export class CreateUserInputType extends OmitType(User, [
  'isDeleted',
  'lastLogin',
  'status',
  'profileImage',
  'approvalStatus',
  'role',
  'password',
]) {}
