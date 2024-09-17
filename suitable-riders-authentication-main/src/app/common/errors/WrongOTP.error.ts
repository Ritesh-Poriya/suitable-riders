import { HttpStatus } from '@nestjs/common';
import { CustomErrorCodes } from '../@types/custom-error-codes';
import { CustomHTTPException } from './custom.exception';

export class WrongOTPError extends CustomHTTPException {
  constructor() {
    super(
      {
        key: 'errors.WRONG_OPT',
      },
      HttpStatus.BAD_REQUEST,
      CustomErrorCodes.WRONG_OPT,
    );
  }
}
