import { Controller, Get, Logger, Param, Redirect, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { createReadStream } from 'fs';
import moment from 'moment';
import { join } from 'path';
import { Public } from '../common/decorators/public-route.decorator';
import { DateTimeQueryParserPipe } from './date-time-query-parser.pipe';
import { LogTypeParserPipe } from './log-type-parser.pipe';

@Controller('api/logs')
export class LogsController {
  constructor(private logger: Logger) {
    this.logger.log('Hello World!');
  }

  @Get('/:type/:dateTime')
  @ApiTags('logs')
  @Public()
  getLogs(
    @Res() res: Response,
    @Param('dateTime', DateTimeQueryParserPipe) dateTime: moment.Moment,
    @Param('type', LogTypeParserPipe) type: string,
  ) {
    const file = createReadStream(
      join(
        __dirname,
        `../../../logs/${type}-${dateTime.format('YYYY-MM-DD-HH')}.log`,
      ),
    );
    file.pipe(res);
  }

  @Get('/:type')
  @ApiTags('logs')
  @Redirect()
  @Public()
  getLogsByType(@Param('type', LogTypeParserPipe) type: string) {
    const dateTime = moment(new Date());
    return {
      url: `/api/logs/${type}/${dateTime.format('YYYY-MM-DD-HH')}`,
    };
  }
}
