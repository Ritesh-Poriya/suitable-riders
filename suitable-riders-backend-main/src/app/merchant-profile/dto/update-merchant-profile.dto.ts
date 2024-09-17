import { PartialType } from '@nestjs/mapped-types';
import { PartialType as PartialTypeSwagger } from '@nestjs/swagger';
import {
  CreateMerchantProfileReqDTO,
  CreateMerchantProfileResDTO,
} from './create-merchant-profile.dto';

export class UpdateMerchantProfileReqDTO extends PartialType(
  CreateMerchantProfileReqDTO,
) {}

export class UpdateMerchantProfileReqSwaggerDTO extends PartialTypeSwagger(
  CreateMerchantProfileReqDTO,
) {}

export class UpdateMerchantProfileResDTO extends CreateMerchantProfileResDTO {}
