import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { GoogleApiController } from './google-api.controller';

@Module({
  controllers: [GoogleApiController],
  imports: [HttpModule],
})
export class GoogleApiModule {}
