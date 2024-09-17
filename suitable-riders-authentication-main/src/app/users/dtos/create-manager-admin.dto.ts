import { PickType } from '@nestjs/mapped-types';
import {
  ApiResponseProperty,
  OmitType,
  PickType as PickTypeSwagger,
} from '@nestjs/swagger';
import { User } from '../entity/user.entity';

export class CreateManagerAdminReqDTO extends PickType(User, [
  'username',
  'email',
  'role',
  'approvalStatus',
  'password',
]) {}

export class CreateManagerAdminReqSwaggerDTO extends PickTypeSwagger(User, [
  'username',
  'email',
  'role',
  'approvalStatus',
  'password',
]) {}

export class CreateManagerAdminResDTO extends OmitType(User, [
  'password',
] as const) {
  @ApiResponseProperty()
  _id: string;
}
