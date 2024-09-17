import { HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { CustomErrorCodes } from 'src/app/common/@types/custom-error-codes';
import { SizeType } from 'src/app/common/@types/image-processing-types';
import { CustomHTTPException } from 'src/app/common/errors/custom.exception';

@Injectable()
export class SizeValidationAndParserPipe implements PipeTransform {
  transform(value: string): SizeType {
    const sizeSplits = value.split('x');
    if (sizeSplits.length !== 2) {
      throw new CustomHTTPException(
        {
          key: 'errors.INVALID_SIZE_FORMAT',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.INVALID_SIZE_FORMAT,
      );
    }
    try {
      const width = parseInt(sizeSplits[0], 10);
      const height = parseInt(sizeSplits[1], 10);
      if (width < 1 || height < 1) {
        throw new CustomHTTPException(
          {
            key: 'errors.INVALID_SIZE_FORMAT',
          },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.INVALID_SIZE_FORMAT,
        );
      }
      return {
        width,
        height,
      };
    } catch (error) {
      throw new CustomHTTPException(
        {
          key: 'errors.INVALID_SIZE_FORMAT',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.INVALID_SIZE_FORMAT,
      );
    }
  }
}
