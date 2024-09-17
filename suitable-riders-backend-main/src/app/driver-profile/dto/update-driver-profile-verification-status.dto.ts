import { PickType } from '@nestjs/mapped-types';
import { DriverProfile } from '../entity/driver-profile.entity';
import { PickType as PickTypeSwagger } from '@nestjs/swagger';
import { UpdateDriverProfileResDTO } from './update-driver-profile.dto';

export class UpdateDriverProfileVerificationStatusReqDTO extends PickType(DriverProfile, [
  'docsVerificationStatus',
]) {}

export class UpdateDriverProfileVerificationStatusSwaggerReqDTO extends PickTypeSwagger(
  DriverProfile,
  ['docsVerificationStatus'],
) {}

export class UpdateDriverProfileVerificationStatusResDTO extends UpdateDriverProfileResDTO {}
