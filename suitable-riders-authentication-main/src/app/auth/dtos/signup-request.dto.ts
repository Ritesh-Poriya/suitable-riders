import { PickType } from '@nestjs/mapped-types';
import { PickType as PickTypeSwagger } from '@nestjs/swagger';
import { ApiResponseProperty } from '@nestjs/swagger';
import { User } from '../../users/entity/user.entity';

export class SignUpRequestDTO extends PickType(User, [
  'email',
  'phoneNo',
] as const) {}

export class SignUpRequestSwaggerDTO extends PickTypeSwagger(User, [
  'email',
  'phoneNo',
] as const) {}

export class SignUpReqResDTO {
  @ApiResponseProperty()
  uid: string;
}
