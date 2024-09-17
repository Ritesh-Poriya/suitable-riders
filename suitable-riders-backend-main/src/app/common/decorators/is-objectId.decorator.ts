import { registerDecorator, ValidationOptions } from 'class-validator';
import { Types } from 'mongoose';

export function IsObjectId(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isObjectId',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['isObjectId'],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value === 'string') {
            return value.constructor === Types.ObjectId;
          } else {
            return true;
          }
        },
        defaultMessage: () => `${propertyName} must be an ObjectId`,
      },
    });
  };
}
