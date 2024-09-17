import { HttpStatus, Injectable } from '@nestjs/common';
import { CustomErrorCodes } from 'src/app/common/@types/custom-error-codes';
import { CropType } from 'src/app/common/@types/image-processing-types';
import { CustomHTTPException } from 'src/app/common/errors/custom.exception';

@Injectable()
export class CropValidationPipe {
  transform(value: string): string {
    switch (value) {
      case 'fit':
        return CropType.FIT;
      case 'fill':
        return CropType.FILL;
      default:
        throw new CustomHTTPException(
          {
            key: 'errors.INVALID_CROP_TYPE',
          },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.INVALID_CROP_TYPE,
        );
    }
  }
}
