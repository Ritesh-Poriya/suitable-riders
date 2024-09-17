import { PickType } from '@nestjs/mapped-types';
import {
  ApiResponseProperty,
  PickType as PickTypeSwagger,
} from '@nestjs/swagger';
import { User } from '../entity/user.entity';

export class UpdateEmailDto extends PickType(User, ['email'] as const) {}

export class UpdateEmailSwaggerDto extends PickTypeSwagger(User, [
  'email',
] as const) {}

export class UpdateEmailResDTO {
  @ApiResponseProperty()
  uid: string;
}
