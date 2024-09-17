import { ApiResponseProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Types } from 'mongoose';
import { Filter } from 'src/app/common/@types/custom-query.filter';
import { IdFieldsSubtype } from 'src/app/common/@types/id-field-subtype';
import { Id } from 'src/app/common/decorators/Id.decorator';

export class SearchSubscriptionTransactionFilterFields extends Filter {
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
 * Search subscription DTO
 */
export class searchSubscriptionTransactionReqDTO extends Filter {}

export class searchSubscriptionTransactionResDTO {
  @ApiResponseProperty()
  subscription: [];
  @ApiResponseProperty()
  filterCount: number;
  @ApiResponseProperty()
  totalCount: number;
}
