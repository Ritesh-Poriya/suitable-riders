import { PickType } from '@nestjs/mapped-types';
import { DriverProfile } from '../entity/driver-profile.entity';
import { PickType as PickTypeSwagger } from '@nestjs/swagger';
import { UpdateDriverProfileResDTO } from './update-driver-profile.dto';

export class UpdateDriverAvailabilityStatusReqDTO extends PickType(
  DriverProfile,
  ['availabilityStatus'],
) {}

export class UpdateDriverAvailabilityStatusSwaggerReqDTO extends PickTypeSwagger(
  DriverProfile,
  ['availabilityStatus'],
) {}

export class UpdateDriverAvailabilityStatusResDTO extends UpdateDriverProfileResDTO {}
