import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import {
  Filter,
  FilterFields,
} from 'src/app/common/@types/custom-query.filter';
import { IdFieldsSubtype } from 'src/app/common/@types/id-field-subtype';
import { Id } from 'src/app/common/decorators/Id.decorator';
import { SearchVehicleResDTO } from './search-vehicle.dto';

export class GetMyVehicleFilterFields extends FilterFields {
  @Id()
  @IsOptional()
  _id: Types.ObjectId | IdFieldsSubtype;
}

export class GetMyVehicleReqDTO extends Filter {
  @ValidateNested({})
  @Type(() => GetMyVehicleFilterFields)
  @IsOptional()
  fields?: GetMyVehicleFilterFields;
}

export class GetMyVehicleResDTO extends SearchVehicleResDTO {}
