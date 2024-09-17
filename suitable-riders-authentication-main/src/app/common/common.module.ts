import { Logger, Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { AllExceptionFilter } from './filters/all-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { RequestLoggingMiddleware } from './middlewares/request-logging.middleware';
import { CustomValidationPipe } from './pipes/custom-validation.pipe';
import { UtilService } from './util.service';

@Module({
  providers: [
    UtilService,
    Logger,
    LoggingInterceptor,
    FilesService,
    RequestLoggingMiddleware,
    AllExceptionFilter,
    CustomValidationPipe,
  ],
  exports: [
    UtilService,
    Logger,
    LoggingInterceptor,
    FilesService,
    RequestLoggingMiddleware,
    AllExceptionFilter,
    CustomValidationPipe,
  ],
})
export class CommonModule {}
