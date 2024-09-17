import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersCoreModule } from '../users/users-core.module';
import {
  SubscribeNewsLetter,
  SubscribeNewsLetterSchema,
} from './entity/subscribe-news-letter.entity';
import { SubscribeNewsLetterService } from './subscribe-news-latter.service';
import { SubscribeNewsLetterController } from './subscribe-news-letter.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubscribeNewsLetter.name, schema: SubscribeNewsLetterSchema },
    ]),
    UsersCoreModule,
  ],
  controllers: [SubscribeNewsLetterController],
  providers: [SubscribeNewsLetterService, Logger],
})
export class SubscribeNewsLetterModule {}
