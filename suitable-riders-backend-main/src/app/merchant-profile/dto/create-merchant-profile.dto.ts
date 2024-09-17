import { PickType } from '@nestjs/mapped-types';
import { MerchantProfile } from '../entity/merchant-profile.entity';
import { PickType as PickTypeSwagger } from '@nestjs/swagger';

export class CreateMerchantProfileReqDTO extends PickType(MerchantProfile, [
  'businessInfo',
  'photoIDInfo',
  'VATCertificateInfo',
  'TaxCertificateInfo',
  'isContractAccepted',
  'rejectionReason',
]) {}
export class CreateMerchantProfileReqSwaggerDTO extends PickTypeSwagger(
  MerchantProfile,
  [
    'businessInfo',
    'photoIDInfo',
    'VATCertificateInfo',
    'TaxCertificateInfo',
    'isContractAccepted',
    'rejectionReason',
  ],
) {}

export class CreateMerchantProfileResDTO extends MerchantProfile {}
