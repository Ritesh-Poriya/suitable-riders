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
import { CreateVehicleResDTO } from './create-vehicle.dto';

export class SearchVehicleFilterFields extends FilterFields {
  @Id()
  @IsOptional()
  _id: Types.ObjectId | IdFieldsSubtype;

  @Id()
  @IsOptional()
  ownerID: Types.ObjectId | IdFieldsSubtype;

  @Id()
  @IsOptional()
  'driver._id': Types.ObjectId | IdFieldsSubtype;
}

export class SearchVehicleReqDTO extends Filter {
  @ValidateNested({})
  @Type(() => SearchVehicleFilterFields)
  @IsOptional()
  fields?: SearchVehicleFilterFields;
}

export class SearchVehicleResDTO {
  @ApiResponseProperty()
  vehicles: CreateVehicleResDTO[];
  @ApiResponseProperty()
  totalCount: number;
}
