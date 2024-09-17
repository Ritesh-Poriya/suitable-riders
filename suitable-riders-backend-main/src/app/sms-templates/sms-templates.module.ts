import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersCoreModule } from '../users/users-core.module';
import {
  SmsTemplates,
  SmsTemplatesSchema,
} from './entity/sms-templates.entity';
import { SmsTemplatesController } from './sms-templates.controller';
import { SmsTemplatesService } from './sms-templates.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SmsTemplates.name, schema: SmsTemplatesSchema },
    ]),
    UsersCoreModule,
  ],
  controllers: [SmsTemplatesController],
  providers: [SmsTemplatesService, Logger],
  exports: [SmsTemplatesService],
})
export class SmsTemplatesModule {}
