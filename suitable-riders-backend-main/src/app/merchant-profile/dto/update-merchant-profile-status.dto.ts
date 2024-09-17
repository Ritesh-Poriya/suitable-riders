import { PickType } from '@nestjs/mapped-types';
import { MerchantProfile } from '../entity/merchant-profile.entity';
import { PickType as PickTypeSwagger } from '@nestjs/swagger';
import { UpdateMerchantProfileResDTO } from './update-merchant-profile.dto';

export class UpdateMerchantProfileStatusReqDTO extends PickType(
  MerchantProfile,
  [
    'VATCertificateInfo',
    'TaxCertificateInfo',
    'photoIDInfo',
    'businessInfo',
    'rejectionReason',
  ],
) {}

export class UpdateMerchantProfileStatusReqSwaggerDTO extends PickTypeSwagger(
  MerchantProfile,
  [
    'VATCertificateInfo',
    'TaxCertificateInfo',
    'photoIDInfo',
    'businessInfo',
    'rejectionReason',
  ],
) {}

export class UpdateMerchantProfileStatusResDTO extends UpdateMerchantProfileResDTO {}
