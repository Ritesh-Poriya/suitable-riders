import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import { DateFields } from 'src/app/common/@types/date-field-subtype';
import { IdFieldsSubtype } from 'src/app/common/@types/id-field-subtype';
import { Id } from 'src/app/common/decorators/Id.decorator';
import { IsDateSearchField } from 'src/app/common/decorators/is-date-search-field.decorator';
import { FilterFields } from '../../common/@types/custom-query.filter';
import { EnumFields } from 'src/app/common/@types/enum-field-subtype';
import { OrderType, PreferredPaymentMethod } from 'src/app/job/@types/job-type';

import { ApiResponseProperty } from '@nestjs/swagger';
import { MerchantJobCountResDTO } from 'src/app/job/dto/merchant-job-count.dto';

export class DashboardResDTO {
  @ApiResponseProperty()
  totalMerchantCount: number;
  @ApiResponseProperty()
  totalRiderCount: {
    android: number;
    ios: number;
    total: number;
  };
  @ApiResponseProperty()
  totalJobCount: number;
  @ApiResponseProperty()
  jobFees: number;
  @ApiResponseProperty()
  totalSpend: number;
  @ApiResponseProperty()
  jobCountForLast30days: [];
}

export class DashboardForMerchantResDTO {
  @ApiResponseProperty()
  totalJobsCount: MerchantJobCountResDTO;
  @ApiResponseProperty()
  jobSpendingCountForLast30days: [];
  @ApiResponseProperty()
  ballancePayable: Number;
}

export class SearchJobsForMerchantDashboard extends FilterFields {
  @Id()
  @IsOptional()
  _id: Types.ObjectId | IdFieldsSubtype;

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

export class FilterJobReqDTO {
  @ValidateNested()
  @Type(() => SearchJobsForMerchantDashboard)
  @IsOptional()
  fields?: SearchJobsForMerchantDashboard;
}
