import { ApiResponseProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import { DateFields } from 'src/app/common/@types/date-field-subtype';
import { IdFieldsSubtype } from 'src/app/common/@types/id-field-subtype';
import { Id } from 'src/app/common/decorators/Id.decorator';
import { IsDateSearchField } from 'src/app/common/decorators/is-date-search-field.decorator';
import { Filter, FilterFields } from '../../common/@types/custom-query.filter';
import { CreateJobResDTO } from './create-job.dto';
import { OrderType, PreferredPaymentMethod } from '../@types/job-type';
import { EnumFields } from 'src/app/common/@types/enum-field-subtype';

export class SearchJobFilterFields extends FilterFields {
  @Id()
  @IsOptional()
  _id: Types.ObjectId | IdFieldsSubtype;

  @Id()
  @IsOptional()
  merchantProfileID: Types.ObjectId | IdFieldsSubtype;

  @Id()
  @IsOptional()
  driverProfileID: Types.ObjectId | IdFieldsSubtype;

  @Id()
  @IsOptional()
  userID: Types.ObjectId | IdFieldsSubtype;

  @Id()
  @IsOptional()
  driverID: Types.ObjectId | IdFieldsSubtype;

  @IsDateSearchField()
  @IsOptional()
  deliveryTime: Date | DateFields;

  @IsDateSearchField()
  @IsOptional()
  pickupTime: Date | DateFields;

  @Id()
  @IsOptional()
  'driverProfile.ownerID': Types.ObjectId | IdFieldsSubtype;

  @Id()
  @IsOptional()
  'merchantProfile.ownerID': Types.ObjectId | IdFieldsSubtype;

  @Id()
  @IsOptional()
  'driverProfile._id': Types.ObjectId | IdFieldsSubtype;

  @Id()
  @IsOptional()
  'merchantProfile._id': Types.ObjectId | IdFieldsSubtype;

  @Id()
  @IsOptional()
  'driver._id': Types.ObjectId | IdFieldsSubtype;

  @Id()
  @IsOptional()
  'merchant._id': Types.ObjectId | IdFieldsSubtype;

  @IsBoolean()
  @IsOptional()
  isFromOutsideRiders: boolean;

  @IsOptional()
  orderType: OrderType | EnumFields;

  @IsOptional()
  preferredPaymentMethod: PreferredPaymentMethod | EnumFields;

  @IsDateSearchField()
  @IsOptional()
  createdAt: Date | DateFields;
}

export class GetJobReqDTO extends Filter {
  @ValidateNested()
  @Type(() => SearchJobFilterFields)
  @IsOptional()
  fields?: SearchJobFilterFields;
}
export class GetJobResDTO {
  @ApiResponseProperty()
  jobs: CreateJobResDTO[];
  @ApiResponseProperty()
  totalCount: number;
}
