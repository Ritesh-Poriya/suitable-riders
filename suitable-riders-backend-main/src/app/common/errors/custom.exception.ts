import { CustomErrorCodes } from '../@types/custom-error-codes';
import { CustomBaseException } from './custom-base.exception';

export class CustomHTTPException extends CustomBaseException {
  constructor(
    message:
      | { key: string; args?: Record<string, any>; logInfo?: any }
      | string,
    status: number,
    code: CustomErrorCodes,
  ) {
    super(message, status, code);
  }
}
