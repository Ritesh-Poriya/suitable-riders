import { applyDecorators } from '@nestjs/common';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { DateFields } from '../@types/date-field-subtype';

export const IsDateSearchField = () => {
  return applyDecorators(
    ValidateNested(),
    Type((object) => {
      if (typeof object.object[object.property] === 'string') {
        return Date;
      } else {
        return DateFields;
      }
    }),
  );
};
