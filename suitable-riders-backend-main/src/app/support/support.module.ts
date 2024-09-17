import { Logger, Module } from '@nestjs/common';
import { UsersCoreModule } from '../users/users-core.module';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';

@Module({
  imports: [UsersCoreModule],
  controllers: [SupportController],
  exports: [],
  providers: [SupportService, Logger],
})
export class SupportModule {}
