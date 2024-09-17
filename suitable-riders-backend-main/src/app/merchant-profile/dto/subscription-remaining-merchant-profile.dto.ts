import { ApiResponseProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import {
  Filter,
  FilterFields,
} from 'src/app/common/@types/custom-query.filter';
import { IdFieldsSubtype } from 'src/app/common/@types/id-field-subtype';
import { Id } from 'src/app/common/decorators/Id.decorator';
import { MerchantProfile } from '../entity/merchant-profile.entity';

export class RemainingSubscriptionMerchantProfileFilterFields extends FilterFields {
  @Id()
  @IsOptional()
  _id?: Types.ObjectId | IdFieldsSubtype;

  @Id()
  @IsOptional()
  'merchant._id': Types.ObjectId | IdFieldsSubtype;

  @Id()
  @IsOptional()
  ownerID: Types.ObjectId | IdFieldsSubtype;
}

/**
 * Remaining Subscription Merchant profile DTO
 */
export class GetRemainingSubscriptionMerchantProfileReqDTO extends Filter {
  @ValidateNested()
  @Type(() => RemainingSubscriptionMerchantProfileFilterFields)
  @IsOptional()
  fields?: RemainingSubscriptionMerchantProfileFilterFields;
}

export class GetRemainingSubscriptionMerchantProfileSwaggerReqDTO extends Filter {
  @ValidateNested()
  @Type(() => RemainingSubscriptionMerchantProfileFilterFields)
  @IsOptional()
  fields?: RemainingSubscriptionMerchantProfileFilterFields;
}

export class GetRemainingSubscriptionMerchantProfileResDTO {
  @ApiResponseProperty()
  MerchantProfile: MerchantProfile[];
  @ApiResponseProperty()
  filteredCount: number;
}
