import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersCoreModule } from '../users/users-core.module';
import { AppVersionController } from './app-version.controller';
import { AppVersionService } from './app-version.service';
import { AppVersionSchema } from './entity/app-version.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'AppVersion', schema: AppVersionSchema },
    ]),
    UsersCoreModule,
  ],
  controllers: [AppVersionController],
  providers: [AppVersionService, Logger],
  exports: [AppVersionService],
})
export class AppVersionModule {}
