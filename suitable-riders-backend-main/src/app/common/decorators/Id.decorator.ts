import { applyDecorators } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import { IdFieldsSubtype } from '../@types/id-field-subtype';
import { IsObjectId } from './is-objectId.decorator';

export const Id = () =>
  applyDecorators(
    IsObjectId(),
    ValidateNested(),
    Transform((value) => {
      if (typeof value.value === 'string') {
        return new Types.ObjectId(value.value);
      } else {
        return value.value;
      }
    }),
    Type((object) => {
      if (typeof object.object[object.property] === 'string') {
        return Types.ObjectId;
      } else {
        return IdFieldsSubtype;
      }
    }),
  );
