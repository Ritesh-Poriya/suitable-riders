import { User } from '../entity/user.entity';
import { OmitType } from '@nestjs/mapped-types';

export class CreateUserInputType extends OmitType(User, [
  'isDeleted',
  'status',
  'profileImage',
  'approvalStatus',
  'role',
  'isSubscriptionActive',
]) {}
