import { HttpException } from '@nestjs/common';
import { CustomErrorCodes } from '../@types/custom-error-codes';

export class CustomBaseException extends HttpException {
  code: CustomErrorCodes;
  constructor(
    response: string | Record<string, any>,
    status: number,
    code: CustomErrorCodes,
  ) {
    super(response, status);
    this.code = code;
  }
}
