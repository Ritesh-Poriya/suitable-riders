import { PickType } from '@nestjs/mapped-types';
import {
  ApiResponseProperty,
  PickType as PickTypeSwagger,
} from '@nestjs/swagger';
import { CreateManagerAdminResDTO } from 'src/app/users/dtos/create-manager-admin.dto';
import { User } from 'src/app/users/entity/user.entity';

export class ManagerAdminLoginReqDTO extends PickType(User, [
  'email',
  'password',
]) {}

export class ManagerAdminLoginReqSwaggerDTO extends PickTypeSwagger(User, [
  'email',
  'password',
]) {}

export class Credentials {
  @ApiResponseProperty()
  accessToken: string;
  @ApiResponseProperty()
  refreshToken: string;
  @ApiResponseProperty({})
  expiresIn: number;
}

export class ManagerAdminLoginResDTO {
  @ApiResponseProperty()
  credentials: Credentials;
  @ApiResponseProperty()
  managerAdmin: CreateManagerAdminResDTO;
}
