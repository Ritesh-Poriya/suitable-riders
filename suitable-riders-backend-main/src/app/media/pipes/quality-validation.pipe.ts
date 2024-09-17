import { HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { CustomErrorCodes } from 'src/app/common/@types/custom-error-codes';
import { CustomHTTPException } from 'src/app/common/errors/custom.exception';

@Injectable()
export class QualityValidationPipe implements PipeTransform {
  transform(value: string): number {
    try {
      const quantity = parseInt(value);
      if (quantity < 1 || quantity > 100) {
        throw new CustomHTTPException(
          {
            key: 'errors.INVALID_QUALITY',
          },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.INVALID_QUALITY,
        );
      }
      return quantity;
    } catch (error) {
      throw new CustomHTTPException(
        {
          key: 'errors.INVALID_QUALITY',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.INVALID_QUALITY,
      );
    }
  }
}
