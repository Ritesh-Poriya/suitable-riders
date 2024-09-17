import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { CustomHTTPException } from '../errors/custom.exception';
import { Response } from 'express';
import { CustomValidationException } from '../errors/custom-validation.exception';
import { CustomErrorCodes } from '../@types/custom-error-codes';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private i18n: I18nService) {}
  async catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    if (exception instanceof CustomValidationException) {
      const status = exception.getStatus();
      const errors = exception.errors;
      const res: {
        message: string;
        property: string;
        code: CustomErrorCodes;
      }[] = [];
      for (const error of errors) {
        const constraints = Object.keys(error.constraints);
        for (const constraint of constraints) {
          res.push({
            message: error.constraints[constraint],
            property: error.property,
            code: CustomErrorCodes.VALIDATION_FAILED,
          });
        }
      }
      response.status(status).json({
        statusCode: status,
        errors: res,
      });
      return;
    }
    if (exception instanceof CustomHTTPException) {
      const status = exception.getStatus();
      const rawMessage = exception.getResponse() as
        | string
        | {
            key: string;
            args: Record<string, any>;
          };
      let message: string;
      if (typeof rawMessage === 'string') {
        message = rawMessage;
      } else {
        const key = rawMessage.key;
        const lang = ctx.getRequest().i18nLang;
        message = await this.i18n.translate(key, {
          args: rawMessage.args,
          lang,
        });
      }
      response.status(status).json({
        errors: [
          {
            message,
            code: exception.code,
          },
        ],
        statusCode: status,
      });
    } else if (exception instanceof NotFoundException) {
      const lang = ctx.getRequest().i18nLang;
      const message = await this.i18n.translate('errors.NOT_FOUND', {
        lang,
      });
      response.status(HttpStatus.NOT_FOUND).json({
        errors: [
          {
            message,
            code: CustomErrorCodes.URL_NOT_FOUND,
          },
        ],
        statusCode: HttpStatus.NOT_FOUND,
      });
    } else {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        errors: [
          {
            message: exception.message,
            code: CustomErrorCodes.UNEXPECTED_ERROR,
          },
        ],
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
