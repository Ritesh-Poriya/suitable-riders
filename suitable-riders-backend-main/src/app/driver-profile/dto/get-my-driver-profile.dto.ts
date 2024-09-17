import { PickType } from '@nestjs/swagger';
import { DriverProfile } from '../entity/driver-profile.entity';

export class GetMyDriverProfileResDTO extends PickType(DriverProfile, [
  'profileImage',
  'licenseDocument',
  'licenseNumber',
  'workPermit',
  'address',
  'isPassportProvided',
  'addressDocument',
  'workPermitDocument',
  'verificationStatus',
  'docsVerificationStatus',
  'subscription',
]) {}
