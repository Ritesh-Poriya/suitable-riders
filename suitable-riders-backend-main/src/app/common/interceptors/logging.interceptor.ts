import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, tap, throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private logger: Logger) {}
  intercept(context: ExecutionContext, next: CallHandler): any {
    const now = Date.now();
    return next.handle().pipe(
      catchError((error) => {
        const time = Date.now() - now;
        this.logger.log(
          `Request: ${
            context.switchToHttp().getRequest().originalUrl
          } - Execution time ${time}ms`,
          'http',
        );
        this.logRequestData(context, error.response);
        this.logger.error(error);
        return throwError(() => error);
      }),
      tap((data) => {
        const time = Date.now() - now;
        this.logger.log(
          `Request: ${
            context.switchToHttp().getRequest().originalUrl
          } - Execution time ${time}ms`,
          'http',
        );
        this.logRequestData(context, data);
      }),
    );
  }

  private logRequestData(context: ExecutionContext, data: any) {
    this.logger.log(
      `Body: ${JSON.stringify(
        context.switchToHttp().getRequest().body,
      )},\nHeaders: ${JSON.stringify(
        context.switchToHttp().getRequest().headers,
      )},\nMethod: ${
        context.switchToHttp().getRequest().method
      },\nQuery: ${JSON.stringify(
        context.switchToHttp().getRequest().query,
      )},\nParams: ${JSON.stringify(
        context.switchToHttp().getRequest().params,
      )},\nResponse: ${JSON.stringify(data)}`,
      'http',
    );
  }
}
