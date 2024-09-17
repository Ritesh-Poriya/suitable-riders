import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';
import * as path from 'path';
import { FilesService } from '../../common/files.service';

@Injectable()
export class HandleLogFilesSchedule {
  constructor(
    private filesService: FilesService,
    private configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async zipAndMoveLogFiles() {
    const deleteLogsAfterDay = this.configService.get<number>(
      'settings.deleteLogsFileAfterDays',
    );
    const logsArchiveDirPath = this.configService.get<string>(
      'settings.logsArchiveDirPath',
    );
    const now = new Date();
    const nowM = moment(now);
    const dayBeforeYesterday = nowM
      .subtract(deleteLogsAfterDay, 'days')
      .format('YYYY-MM-DD');

    const logFiles = await this.filesService.findFilesWithWildcard(
      path.resolve(`${__dirname}/../../../logs/*-${dayBeforeYesterday}-*.log`),
    );

    await this.filesService.zipDirectory(
      logFiles,
      path.resolve(`${__dirname}/../../../logs/${dayBeforeYesterday}.zip`),
    );

    await this.filesService.moveFileToDirectory(
      path.resolve(`${__dirname}/../../../logs/${dayBeforeYesterday}.zip`),
      logsArchiveDirPath,
    );

    await this.filesService.deleteFiles(logFiles);
  }
}
