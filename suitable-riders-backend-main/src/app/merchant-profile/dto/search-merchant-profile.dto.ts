import { ApiResponseProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import {
  Filter,
  FilterFields,
} from 'src/app/common/@types/custom-query.filter';
import { DateFields } from 'src/app/common/@types/date-field-subtype';
import { IdFieldsSubtype } from 'src/app/common/@types/id-field-subtype';
import { Id } from 'src/app/common/decorators/Id.decorator';
import { IsDateSearchField } from 'src/app/common/decorators/is-date-search-field.decorator';
import { MerchantProfile } from '../entity/merchant-profile.entity';

export class SearchMerchantProfileFilterFields extends FilterFields {
  @Id()
  @IsOptional()
  _id?: Types.ObjectId | IdFieldsSubtype;

  @Id()
  @IsOptional()
  'merchant._id': Types.ObjectId | IdFieldsSubtype;

  @Id()
  @IsOptional()
  ownerID: Types.ObjectId | IdFieldsSubtype;

  @IsDateSearchField()
  @IsOptional()
  'merchant.lastLogin': Date | DateFields;
}

/**
 * Search Merchant profile DTO
 */
export class searchMerchantProfileReqDTO extends Filter {
  @ValidateNested()
  @Type(() => SearchMerchantProfileFilterFields)
  @IsOptional()
  fields?: SearchMerchantProfileFilterFields;
}

export class searchMerchantProfileSwaggerReqDTO extends Filter {
  @ValidateNested()
  @Type(() => SearchMerchantProfileFilterFields)
  @IsOptional()
  fields?: SearchMerchantProfileFilterFields;
}

export class searchMerchantProfileResDTO {
  @ApiResponseProperty()
  data: MerchantProfile[];
  @ApiResponseProperty()
  totalCount: number;
}
