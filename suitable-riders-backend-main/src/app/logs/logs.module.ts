import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { LogsController } from './logs.controller';
import { HandleLogFilesSchedule } from './scheduledTasks/handle-log-files.schedule';

@Module({
  imports: [LogsModule, CommonModule],
  controllers: [LogsController],
  providers: [HandleLogFilesSchedule],
})
export class LogsModule {}
