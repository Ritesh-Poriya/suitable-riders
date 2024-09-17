import { HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import * as moment from 'moment';
import { CustomErrorCodes } from '../common/@types/custom-error-codes';
import { CustomHTTPException } from '../common/errors/custom.exception';

@Injectable()
export class DateTimeQueryParserPipe implements PipeTransform {
  transform(value: any): any {
    if (!value) {
      return;
    }
    const dateM = moment(value, 'YYYY-MM-DD-HH');
    if (!dateM.isValid()) {
      throw new CustomHTTPException(
        {
          key: 'errors.INVALID_DATE_FORMAT',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.INVALID_DATE_FORMAT,
      );
    }
    return dateM;
  }
}
