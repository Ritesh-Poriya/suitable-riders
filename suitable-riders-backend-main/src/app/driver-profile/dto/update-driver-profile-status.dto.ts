import { PickType } from '@nestjs/mapped-types';
import { DriverProfile } from '../entity/driver-profile.entity';
import { PickType as PickTypeSwagger } from '@nestjs/swagger';
import { UpdateDriverProfileResDTO } from './update-driver-profile.dto';

export class UpdateDriverProfileStatusReqDTO extends PickType(DriverProfile, [
  'status',
]) {}

export class UpdateDriverProfileStatusSwaggerReqDTO extends PickTypeSwagger(
  DriverProfile,
  ['status'],
) {}

export class UpdateDriverProfileStatusResDTO extends UpdateDriverProfileResDTO {}
