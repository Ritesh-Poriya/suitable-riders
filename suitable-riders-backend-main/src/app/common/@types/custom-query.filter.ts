import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import { IsDateSearchField } from '../decorators/is-date-search-field.decorator';
import { DateFields } from './date-field-subtype';

export class FilterFields {
  @IsDateSearchField()
  @IsOptional()
  createdAt?: Date | DateFields;

  @IsDateSearchField()
  @IsOptional()
  updatedAt?: Date | DateFields;

  [k: string]:
    | string
    | any[]
    | Types.ObjectId
    | number
    | Date
    | boolean
    | {
        $eq?: number | string | boolean | Date | Types.ObjectId;
        $ne?: number | string | boolean | Date | Types.ObjectId;
        $gt?: number | Date;
        $lt?: number | Date;
        $gte?: number | Date;
        $lte?: number | Date;
        $in?: Array<string> | Array<number> | Array<Types.ObjectId>;
        $nin?: Array<string> | Array<number> | Array<Types.ObjectId>;
        $exists?: boolean;
      };
}

export class FilterOptions {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  skip: number;
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  limit: number;
  @ApiProperty()
  @IsObject()
  @IsOptional()
  sort?: Record<string, 1 | -1>;
}

export class IFilterSelectFields {
  [k: string]: [1, 0];
}

export interface IFilter {
  fields?: FilterFields;
  options?: FilterOptions;
  searches?: string;
}

export class Filter {
  @ApiProperty()
  @ValidateNested({})
  @Type(() => FilterFields)
  @IsOptional()
  fields?: FilterFields;
  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => FilterOptions)
  options: FilterOptions;
  @IsOptional()
  @ApiProperty()
  @IsString()
  searches?: string;
}
