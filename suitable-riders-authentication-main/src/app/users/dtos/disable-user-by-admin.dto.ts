import { PickType } from '@nestjs/mapped-types';
import { User } from '../entity/user.entity';
import { PickType as PickTypeSwagger } from '@nestjs/swagger';

/**
 * Disable  user by admin DTO
 */
export class UpdateStatusReqDTO extends PickType(User, ['status']) {}
export class UpdateStatusSwaggerReqDTO extends PickTypeSwagger(User, [
  'status',
]) {}

export class UpdateStatusSwaggerResDTO extends User {}
