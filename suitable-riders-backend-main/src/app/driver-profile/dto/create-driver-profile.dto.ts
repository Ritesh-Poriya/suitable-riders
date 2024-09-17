import { PickType } from '@nestjs/mapped-types';
import { DriverProfile } from '../entity/driver-profile.entity';
import { PickType as PickTypeSwagger } from '@nestjs/swagger';

export class CreateDriverProfileReqDTO extends PickType(DriverProfile, [
  'profileImage',
  'licenseDocument',
  'licenseNumber',
  'workPermit',
  'address',
  'addressDocument',
  'workPermitDocument',
  'isPassportProvided',
]) {}

export class CreateDriverProfileReqSwaggerDTO extends PickTypeSwagger(
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
  ],
) {}

export class CreateDriverProfileResDTO extends DriverProfile {}
