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
import { DriverProfile } from '../entity/driver-profile.entity';
import { VerificationStatus } from '../@types/driver-profile-status-types';

export class SearchDriverProfileFilterFields extends FilterFields {
  @Id()
  @IsOptional()
  _id: Types.ObjectId | IdFieldsSubtype;

  @Id()
  @IsOptional()
  'driver._id': Types.ObjectId | IdFieldsSubtype;

  @IsDateSearchField()
  @IsOptional()
  'driver.lastLogin': Date | DateFields;

  @Id()
  @IsOptional()
  verificationStatus: VerificationStatus | IdFieldsSubtype;
}

/**
 * Search driver profile DTO
 */
export class SearchDriverProfileReqDTO extends Filter {
  @ValidateNested({})
  @Type(() => SearchDriverProfileFilterFields)
  @IsOptional()
  fields?: SearchDriverProfileFilterFields;
}

export class ServiceDriverProfileSwaggerReqDTO extends Filter {
  @ValidateNested({})
  @Type(() => SearchDriverProfileFilterFields)
  @IsOptional()
  fields?: SearchDriverProfileFilterFields;
}

export class ServiceDriverProfileResDTO {
  @ApiResponseProperty()
  data: DriverProfile[];
  @ApiResponseProperty()
  totalCount: number;
}
