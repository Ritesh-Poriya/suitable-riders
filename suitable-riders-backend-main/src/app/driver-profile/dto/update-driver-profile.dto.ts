import { CreateDriverProfileResDTO } from './create-driver-profile.dto';
import { PickType } from '@nestjs/mapped-types';
import { DriverProfile } from '../entity/driver-profile.entity';
import { PickType as PickTypeSwagger } from '@nestjs/swagger';

export class UpdateDriverProfileReqDTO extends PickType(DriverProfile, [
  'profileImage',
  'licenseDocument',
  'licenseNumber',
  'workPermit',
  'address',
  'addressDocument',
  'workPermitDocument',
  'isPassportProvided',
  'stripeID',
]) {}

export class UpdateDriverProfileSwaggerReqDTO extends PickTypeSwagger(
  DriverProfile,
  [
    'profileImage',
    'licenseDocument',
    'licenseNumber',
    'workPermit',
    'address',
    'addressDocument',
    'workPermitDocument',
    'isPassportProvided',
    'stripeID',
  ],
) {}

export class UpdateDriverProfileResDTO extends CreateDriverProfileResDTO {}
