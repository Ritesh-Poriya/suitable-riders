import { Module } from '@nestjs/common';
import { BlockingModule } from '../blocking/blocking.module';
import { CommonModule } from '../common/common.module';
import { ParseContactPipe } from './pipes/parse-contact-pipe';
import { UsersCoreModule } from './users-core.module';
import { UsersController } from './users.controller';

@Module({
  imports: [UsersCoreModule, CommonModule, BlockingModule],
  providers: [ParseContactPipe],
  controllers: [UsersController],
})
export class UsersModule {}
