import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsLatitude, IsLongitude, ValidateNested } from 'class-validator';
import { Filter } from 'src/app/common/@types/custom-query.filter';
import { CreateJobResDTO } from './create-job.dto';
import { SearchJobFilterFields } from './get-job.dto';

export class DriverSearchJobFilterFields extends SearchJobFilterFields {
  @IsLatitude()
  @ApiProperty()
  lat: number;
  @IsLongitude()
  @ApiProperty()
  lng: number;
}

export class DriverSearchJobFilterDTO extends Filter {
  @ValidateNested()
  @Type(() => DriverSearchJobFilterFields)
  fields?: DriverSearchJobFilterFields;
}

export class DriverSearchJobFilterResDTO {
  @ApiResponseProperty()
  jobs: CreateJobResDTO[];
  @ApiResponseProperty()
  filterCount: number;
}
