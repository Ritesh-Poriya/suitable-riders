import { CustomErrorCodes } from '../@types/custom-error-codes';
import { CustomHTTPException } from './custom.exception';

export class UnexpectedError extends CustomHTTPException {
  constructor(message: { key: string; args: Record<string, any> } | string) {
    super(message, 500, CustomErrorCodes.UNEXPECTED_ERROR);
  }
}
