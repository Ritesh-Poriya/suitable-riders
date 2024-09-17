import { HttpStatus, PipeTransform } from '@nestjs/common';
import { CustomErrorCodes } from '../common/@types/custom-error-codes';
import { CustomHTTPException } from '../common/errors/custom.exception';

export class LogTypeParserPipe implements PipeTransform {
  transform(value: string): any {
    if (['requests', 'error', 'debug'].includes(value.toLowerCase())) {
      return value.toLowerCase();
    } else {
      throw new CustomHTTPException(
        {
          key: 'errors.INVALID_LOG_TYPE',
        },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.INVALID_LOG_TYPE,
      );
    }
  }
}
