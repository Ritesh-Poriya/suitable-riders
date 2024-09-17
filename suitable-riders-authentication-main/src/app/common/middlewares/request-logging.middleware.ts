import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(private logger: Logger) {}
  use(req: Request, res: Response, next: NextFunction) {
    console.log(req.url);
    this.logger.verbose(
      `\ncurl --location --request ${req.method} '${
        req.get('origin') || 'http://' + req.get('host')
      }${req.originalUrl}'\n ${this.getHeaderString(
        req,
      )}\n --data-raw '${JSON.stringify(req.body)}'\n\n\n`,
    );
    next();
  }

  private getHeaderString(req: Request) {
    let str = ``;
    for (const key in req.headers) {
      if (req.headers.hasOwnProperty(key)) {
        str += `--header '${key}: ${req.headers[key]}'  `;
      }
    }
    return str;
  }
}
