import { Transform, Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from '../decorators/is-objectId.decorator';
import logger from '../logger';

export class IdFieldsSubtype {
  @IsObjectId()
  @Transform((value) => new Types.ObjectId(value.value))
  @IsOptional()
  $eq?: Types.ObjectId;
  @IsObjectId()
  @Transform((value) => new Types.ObjectId(value.value))
  @IsOptional()
  $ne?: Types.ObjectId;
  @ValidateNested({ each: true, message: 'Validation failed at $in' })
  @Transform((value) => {
    try {
      return value.value.map((id) => new Types.ObjectId(id));
    } catch (e) {
      logger.error(`Error while parsing IdFieldsSubtype: ${e}`);
      return value.value;
    }
  })
  @Type(() => Types.ObjectId)
  @IsOptional()
  $in?: Types.ObjectId[];
  @ValidateNested({ each: true, message: 'Validation failed at $nin' })
  @Transform((value) => {
    try {
      return value.value.map((id) => new Types.ObjectId(id));
    } catch (e) {
      logger.error(`Error while parsing IdFieldsSubtype: ${e}`);
      return value.value;
    }
  })
  @Type(() => Types.ObjectId)
  @IsOptional()
  $nin?: Types.ObjectId[];

  constructor(value: any) {
    Object.assign(this, value);
  }
}
